
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { CollaborationService } from '@/src/infrastructure/api/generated/services/CollaborationService';
import i18n from '@/src/infrastructure/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    user?: {
        name: string;
        avatar?: string;
    };
    isMine: boolean;
}

interface AttachmentCommentsProps {
    attachmentId: string;
    currentUserId?: string;
}

export const AttachmentComments: React.FC<AttachmentCommentsProps> = ({ attachmentId, currentUserId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [saving, setSaving] = useState(false);
    const { colors } = useSettings();
    const editInputRef = useRef<TextInput>(null);

    useEffect(() => {
        fetchComments();
    }, [attachmentId]);

    const fetchComments = async () => {
        try {
            const response = await CollaborationService.getCollaborationComments(attachmentId);
            if (response.success && Array.isArray(response.data)) {
                const mappedComments = response.data.map((c: any) => ({
                    ...c,
                    isMine: c.userId === currentUserId
                }));
                setComments(mappedComments);
            }
        } catch (error) {
            console.error('Failed to fetch comments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;

        const tempId = Date.now().toString();
        const optimisticComment: Comment = {
            id: tempId,
            text: newComment,
            createdAt: new Date().toISOString(),
            isMine: true,
            user: { name: 'Me' }
        };

        setComments(prev => [optimisticComment, ...prev]);
        setNewComment('');
        setSending(true);

        try {
            const response = await CollaborationService.postCollaborationComments({
                attachmentId,
                text: optimisticComment.text
            });

            if (response.success) {
                fetchComments();
            } else {
                throw new Error('Failed to post comment');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send comment');
            setComments(prev => prev.filter(c => c.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            i18n.t('common.actions.delete'),
            i18n.t('collaboration.comments.deleteConfirm', { defaultValue: 'Delete this comment?' }),
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await CollaborationService.deleteCollaborationComments(id);
                            setComments(prev => prev.filter(c => c.id !== id));
                        } catch {
                            Alert.alert('Error', 'Failed to delete comment');
                        }
                    }
                }
            ]
        );
    };

    const startEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditText(comment.text);
        setTimeout(() => editInputRef.current?.focus(), 100);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleSaveEdit = async () => {
        if (!editText.trim() || !editingId) return;
        setSaving(true);
        try {
            await CollaborationService.patchCollaborationComments(editingId, { text: editText.trim() });
            setComments(prev => prev.map(c => c.id === editingId ? { ...c, text: editText.trim() } : c));
            setEditingId(null);
            setEditText('');
        } catch {
            Alert.alert('Error', 'Failed to update comment');
        } finally {
            setSaving(false);
        }
    };

    const showCommentActions = (comment: Comment) => {
        Alert.alert(
            i18n.t('collaboration.comments.actions', { defaultValue: 'Comment' }),
            undefined,
            [
                { text: i18n.t('common.actions.edit'), onPress: () => startEdit(comment) },
                { text: i18n.t('common.actions.delete'), style: 'destructive', onPress: () => handleDelete(comment.id) },
                { text: i18n.t('common.actions.cancel'), style: 'cancel' }
            ]
        );
    };

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat(i18n.locale === 'tr' ? 'tr-TR' : 'en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }).format(new Date(dateString));
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />;
    }

    const displayedComments = showAll ? comments : comments.slice(0, 3);

    return (
        <View style={styles.container}>
            <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder={i18n.t('writeComment') || 'Write a comment...'}
                    placeholderTextColor={colors.text}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: colors.primary }, (!newComment.trim() || sending) && styles.disabledButton]}
                    onPress={handleSend}
                    disabled={!newComment.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Ionicons name="send" size={20} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayedComments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                        <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                            {item.user?.avatar ? (
                                <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{(item.user?.name || '?').charAt(0)}</Text>
                            )}
                        </View>
                        <View style={[styles.bubble, { backgroundColor: item.isMine ? colors.primary + '15' : colors.card }]}>
                            <View style={styles.header}>
                                <Text style={[styles.userName, { color: colors.text }]}>{item.user?.name || 'User'}</Text>
                                <View style={styles.headerRight}>
                                    <Text style={[styles.time, { color: colors.text }]}>{formatDate(item.createdAt)}</Text>
                                    {item.isMine && editingId !== item.id && (
                                        <TouchableOpacity onPress={() => showCommentActions(item)} style={styles.moreButton}>
                                            <Ionicons name="ellipsis-horizontal" size={14} color={colors.text} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {editingId === item.id ? (
                                <View>
                                    <TextInput
                                        ref={editInputRef}
                                        style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        value={editText}
                                        onChangeText={setEditText}
                                        multiline
                                        autoFocus
                                    />
                                    <View style={styles.editActions}>
                                        <TouchableOpacity
                                            onPress={cancelEdit}
                                            style={[styles.editBtn, { borderColor: colors.border }]}
                                        >
                                            <Text style={{ color: colors.text, fontSize: 13 }}>{i18n.t('common.actions.cancel')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleSaveEdit}
                                            disabled={!editText.trim() || saving}
                                            style={[styles.editBtn, { backgroundColor: colors.primary, borderColor: colors.primary, opacity: (!editText.trim() || saving) ? 0.5 : 1 }]}
                                        >
                                            {saving
                                                ? <ActivityIndicator size="small" color="#fff" />
                                                : <Text style={{ color: '#fff', fontSize: 13 }}>{i18n.t('common.actions.save')}</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text>
                            )}
                        </View>
                    </View>
                )}
                scrollEnabled={false}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: colors.text, opacity: 0.6, marginTop: 10 }}>
                        {i18n.t('collaboration.comments.empty', { defaultValue: 'No comments yet.' })}
                    </Text>
                }
            />

            {comments.length > 3 && !showAll && (
                <TouchableOpacity onPress={() => setShowAll(true)} style={styles.viewMore}>
                    <Text style={[styles.viewMoreText, { color: colors.primary }]}>
                        {i18n.t('viewAllComments') || `View all ${comments.length} comments`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 0,
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        fontSize: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    bubble: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderTopLeftRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userName: {
        fontSize: 13,
        fontWeight: '600',
    },
    time: {
        fontSize: 11,
        opacity: 0.7,
    },
    moreButton: {
        padding: 2,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
    },
    editInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
        minHeight: 60,
        marginBottom: 8,
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 64,
    },
    viewMore: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    viewMoreText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
