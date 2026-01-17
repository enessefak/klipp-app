
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { CollaborationService } from '@/src/infrastructure/api/generated/services/CollaborationService';
import i18n from '@/src/infrastructure/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TagData {
    id: string;
    name: string;
    color: string;
}

interface AttachmentTagsProps {
    attachmentId: string;
    initialTags?: TagData[];
    onTagsUpdate?: () => void;
}

const EMPTY_TAGS: TagData[] = [];

export const AttachmentTags: React.FC<AttachmentTagsProps> = ({ attachmentId, initialTags = EMPTY_TAGS, onTagsUpdate }) => {
    const [tags, setTags] = useState<TagData[]>(initialTags);
    const [modalVisible, setModalVisible] = useState(false);
    const [allTags, setAllTags] = useState<TagData[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const { colors } = useSettings();

    useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);

    const fetchAllTags = async () => {
        setLoadingTags(true);
        try {
            const response = await CollaborationService.getCollaborationTags();
            if (response.success && response.data) {
                setAllTags(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch tags', error);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleOpenModal = () => {
        setModalVisible(true);
        fetchAllTags();
    };

    const handleAttachTag = async (tag: TagData) => {
        setLoadingAction(true);
        try {
            await CollaborationService.postCollaborationTagsAttach({
                attachmentId,
                tagId: tag.id
            });
            setTags(prev => [...prev, tag]);
            onTagsUpdate?.();
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to attach tag');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDetachTag = async (tagId: string) => {
        Alert.alert(
            i18n.t('removeTag') || 'Remove Tag',
            i18n.t('confirmRemoveTag') || 'Are you sure you want to remove this tag?',
            [
                { text: i18n.t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: i18n.t('remove') || 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await CollaborationService.postCollaborationTagsDetach({
                                attachmentId,
                                tagId
                            });
                            setTags(prev => prev.filter(t => t.id !== tagId));
                            onTagsUpdate?.();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove tag');
                        }
                    }
                }
            ]
        );
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        setLoadingAction(true);
        try {
            const response = await CollaborationService.postCollaborationTags({
                name: newTagName,
                color: '#3B82F6' // Default color for now
            });

            if (response.success && response.data) {
                // Determine if we should attach it immediately
                await handleAttachTag(response.data);
                setNewTagName('');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create tag');
            setLoadingAction(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tagsRow}>
                {tags.map(tag => (
                    <View key={tag.id} style={[styles.tagChip, { backgroundColor: (tag.color || colors.primary) + '20', borderColor: tag.color || colors.primary }]}>
                        <Text style={[styles.tagText, { color: tag.color || colors.primary }]}>{tag.name}</Text>
                        <TouchableOpacity onPress={() => handleDetachTag(tag.id)}>
                            <Ionicons name="close" size={14} color={tag.color || colors.primary} />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={[styles.addButton, { borderColor: colors.border }]} onPress={handleOpenModal}>
                    <Ionicons name="add" size={16} color={colors.text} />
                    <Text style={[styles.addText, { color: colors.text }]}>{i18n.t('addTag') || 'Add Tag'}</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Manage Tags</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.createContainer}>
                            <TextInput
                                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                                placeholder="New tag name"
                                placeholderTextColor={colors.text}
                                value={newTagName}
                                onChangeText={setNewTagName}
                            />
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: colors.primary }, loadingAction && styles.disabledButton]}
                                onPress={handleCreateTag}
                                disabled={loadingAction || !newTagName.trim()}
                            >
                                {loadingAction ? <ActivityIndicator color="#FFF" /> : <Ionicons name="add" size={20} color="#FFF" />}
                            </TouchableOpacity>
                        </View>

                        {loadingTags ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                        ) : (
                            <FlatList
                                data={allTags.filter(t => !tags.some(attached => attached.id === t.id))}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.tagItem, { borderBottomColor: colors.border }]}
                                        onPress={() => handleAttachTag(item)}
                                        disabled={loadingAction}
                                    >
                                        <Ionicons name="pricetag" size={16} color={item.color || colors.primary} />
                                        <Text style={[styles.tagItemText, { color: colors.text }]}>{item.name}</Text>
                                        <Ionicons name="add-circle-outline" size={20} color={colors.text} />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={[styles.emptyText, { color: colors.text }]}>No other tags available.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 4,
    },
    addText: {
        fontSize: 12,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    createContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
    },
    createButton: {
        borderRadius: 8,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    tagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    tagItemText: {
        flex: 1,
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        opacity: 0.6,
    },
});
