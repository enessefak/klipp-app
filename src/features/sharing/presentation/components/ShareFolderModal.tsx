import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { SearchedUser, SharePermission } from '../../domain/FolderShare';
import { useFolderSharing } from '../useFolderSharing';

interface ShareFolderModalProps {
    visible: boolean;
    onClose: () => void;
    folderId: string;
    folderName: string;
}

export function ShareFolderModal({ visible, onClose, folderId, folderName }: ShareFolderModalProps) {
    const { colors } = useSettings();
    const { searchUsers, shareFolder, searchResults, loading } = useFolderSharing();
    const [email, setEmail] = useState('');
    const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
    const [permission, setPermission] = useState<SharePermission>('VIEW');
    const [sharing, setSharing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleEmailChange = useCallback((text: string) => {
        setEmail(text);
        setSelectedUser(null);
        setErrorMsg(null);
        setSearched(false);
    }, []);

    const handleSearch = useCallback(async () => {
        if (!email.includes('@')) {
            setErrorMsg(i18n.t('sharing.modal.error_email'));
            return;
        }
        setSearched(true);
        await searchUsers(email);
    }, [email, searchUsers]);

    const handleSelectUser = (user: SearchedUser) => {
        setSelectedUser(user);
        setEmail(user.email);
        setErrorMsg(null);
    };

    const handleShare = async () => {
        if (!selectedUser) {
            setErrorMsg(i18n.t('sharing.modal.error_select_user'));
            return;
        }

        setSharing(true);
        setErrorMsg(null);

        const result = await shareFolder({
            folderId,
            targetUserId: selectedUser.id,
            permission,
        });

        setSharing(false);

        if (result) {
            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 1500);
        } else {
            setErrorMsg(i18n.t('sharing.modal.error_generic'));
        }
    };

    const handleClose = () => {
        setEmail('');
        setSelectedUser(null);
        setPermission('VIEW');
        setSuccess(false);
        setErrorMsg(null);
        setSearched(false);
        onClose();
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        cancelButton: {
            color: colors.primary,
            fontSize: 16,
        },
        title: {
            fontSize: 17,
            color: colors.text,
        },
        folderInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.card,
            marginBottom: 16,
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
        },
        folderName: {
            fontSize: 18,
            color: colors.text,
        },
        searchContainer: {
            paddingHorizontal: 16,
            marginBottom: 8,
        },
        searchRow: {
            flexDirection: 'row',
            gap: 8,
        },
        searchButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 60,
        },
        searchButtonText: {
            color: colors.white,
            fontWeight: '600',
            fontSize: 14,
        },
        hint: {
            fontSize: 12,
            color: colors.gray,
            marginTop: 6,
        },
        noResultContainer: {
            alignItems: 'center',
            paddingVertical: 24,
            paddingHorizontal: 16,
        },
        noResultText: {
            color: colors.gray,
            marginTop: 8,
            textAlign: 'center',
        },
        label: {
            fontSize: 14,
            color: colors.text,
            marginBottom: 8,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
        },
        resultsList: {
            maxHeight: 200,
            marginHorizontal: 16,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        userItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
        userInfo: {
            flex: 1,
        },
        userEmail: {
            fontSize: 13,
            color: colors.gray,
        },
        selectedUserContainer: {
            paddingHorizontal: 16,
        },
        selectedUser: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            gap: 12,
            marginBottom: 16,
        },
        permissionContainer: {
            marginTop: 8,
        },
        permissionOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        permissionOption: {
            // flex: 1, // Remove flex: 1 to allow custom sizing
            width: '48%', // Approx half with gap
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 14,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            gap: 8,
        },
        permissionSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        permissionText: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '600',
        },
        permissionTextSelected: {
            color: colors.white,
        },
        errorText: {
            color: colors.error,
            textAlign: 'center',
            marginTop: 16,
            paddingHorizontal: 16,
        },
        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: colors.background, // Fixed: was colors.white
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        shareButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
        },
        shareButtonDisabled: {
            backgroundColor: colors.gray,
        },
        shareButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
        successContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        successText: {
            marginTop: 16,
            color: colors.success,
        },
    }), [colors]);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <ThemedText style={styles.cancelButton}>{i18n.t('sharing.modal.cancel')}</ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="defaultSemiBold" style={styles.title}>{i18n.t('sharing.modal.title')}</ThemedText>
                    <View style={{ width: 50 }} />
                </View>

                {/* Folder Info */}
                <View style={styles.folderInfo}>
                    <IconSymbol name="folder.fill" size={32} color={colors.primary} />
                    <ThemedText type="defaultSemiBold" style={styles.folderName}>{folderName}</ThemedText>
                </View>

                {success ? (
                    <View style={styles.successContainer}>
                        <IconSymbol name="checkmark.circle.fill" size={64} color={colors.success} />
                        <ThemedText type="subtitle" style={styles.successText}>
                            {i18n.t('sharing.modal.success')}
                        </ThemedText>
                    </View>
                ) : (
                    <>
                        {/* Search Input */}
                        <View style={styles.searchContainer}>
                            <ThemedText type="defaultSemiBold" style={styles.label}>{i18n.t('sharing.modal.search_title')}</ThemedText>
                            <View style={styles.searchRow}>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <IconSymbol name="magnifyingglass" size={20} color={colors.gray} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={i18n.t('sharing.modal.search_placeholder')}
                                        placeholderTextColor={colors.gray}
                                        value={email}
                                        onChangeText={handleEmailChange}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onSubmitEditing={handleSearch}
                                        returnKeyType="search"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={handleSearch}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <ThemedText style={styles.searchButtonText}>{i18n.t('sharing.modal.search_button')}</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <ThemedText style={styles.hint}>
                                {i18n.t('sharing.modal.search_hint')}
                            </ThemedText>
                        </View>

                        {/* Search Results */}
                        {searched && !loading && searchResults.length === 0 && (
                            <View style={styles.noResultContainer}>
                                <IconSymbol name="person.slash.fill" size={40} color={colors.gray} />
                                <ThemedText style={styles.noResultText}>
                                    {i18n.t('sharing.modal.no_result')}
                                </ThemedText>
                            </View>
                        )}

                        {!selectedUser && searchResults.length > 0 && (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                style={styles.resultsList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.userItem}
                                        onPress={() => handleSelectUser(item)}
                                    >
                                        <View style={styles.avatar}>
                                            <ThemedText style={styles.avatarText}>
                                                {item.name.charAt(0).toUpperCase()}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.userInfo}>
                                            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                            <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        {/* Selected User */}
                        {selectedUser && (
                            <View style={styles.selectedUserContainer}>
                                <View style={styles.selectedUser}>
                                    <View style={styles.avatar}>
                                        <ThemedText style={styles.avatarText}>
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <ThemedText type="defaultSemiBold">{selectedUser.name}</ThemedText>
                                        <ThemedText style={styles.userEmail}>{selectedUser.email}</ThemedText>
                                    </View>
                                    <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                        <IconSymbol name="xmark.circle.fill" size={24} color={colors.gray} />
                                    </TouchableOpacity>
                                </View>

                                {/* Permission Selector */}
                                <View style={styles.permissionContainer}>
                                    <ThemedText type="defaultSemiBold" style={styles.label}>{i18n.t('sharing.modal.permission_level')}</ThemedText>
                                    <View style={styles.permissionOptions}>
                                        <TouchableOpacity
                                            style={[
                                                styles.permissionOption,
                                                permission === 'VIEW' && styles.permissionSelected
                                            ]}
                                            onPress={() => setPermission('VIEW')}
                                        >
                                            <IconSymbol
                                                name="eye.fill"
                                                size={20}
                                                color={permission === 'VIEW' ? colors.white : colors.primary}
                                            />
                                            <ThemedText
                                                style={[
                                                    styles.permissionText,
                                                    permission === 'VIEW' && styles.permissionTextSelected
                                                ]}
                                            >
                                                {i18n.t('sharing.modal.roles.viewer')}
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.permissionOption,
                                                permission === 'EDIT' && styles.permissionSelected
                                            ]}
                                            onPress={() => setPermission('EDIT')}
                                        >
                                            <IconSymbol
                                                name="pencil"
                                                size={20}
                                                color={permission === 'EDIT' ? colors.white : colors.primary}
                                            />
                                            <ThemedText
                                                style={[
                                                    styles.permissionText,
                                                    permission === 'EDIT' && styles.permissionTextSelected
                                                ]}
                                            >
                                                {i18n.t('sharing.modal.roles.editor')}
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.permissionOption,
                                                permission === 'CREATE' && styles.permissionSelected
                                            ]}
                                            onPress={() => setPermission('CREATE')}
                                        >
                                            <IconSymbol
                                                name="plus.circle.fill"
                                                size={20}
                                                color={permission === 'CREATE' ? colors.white : colors.primary}
                                            />
                                            <ThemedText
                                                style={[
                                                    styles.permissionText,
                                                    permission === 'CREATE' && styles.permissionTextSelected
                                                ]}
                                            >
                                                {i18n.t('sharing.modal.roles.create')}
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.permissionOption,
                                                permission === 'FULL' && styles.permissionSelected
                                            ]}
                                            onPress={() => setPermission('FULL')}
                                        >
                                            <IconSymbol
                                                name="star.circle.fill"
                                                size={20}
                                                color={permission === 'FULL' ? colors.white : colors.primary}
                                            />
                                            <ThemedText
                                                style={[
                                                    styles.permissionText,
                                                    permission === 'FULL' && styles.permissionTextSelected
                                                ]}
                                            >
                                                {i18n.t('sharing.modal.roles.full')}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Error Message */}
                        {errorMsg && (
                            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
                        )}

                        {/* Share Button */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.shareButton,
                                    (!selectedUser || sharing) && styles.shareButtonDisabled
                                ]}
                                onPress={handleShare}
                                disabled={!selectedUser || sharing}
                            >
                                {sharing ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <>
                                        <IconSymbol name="paperplane.fill" size={20} color={colors.white} />
                                        <ThemedText style={styles.shareButtonText}>{i18n.t('sharing.modal.share_button')}</ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>
        </Modal>
    );
}
