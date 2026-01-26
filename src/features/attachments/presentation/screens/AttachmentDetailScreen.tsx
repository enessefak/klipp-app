import { IconSymbol } from '@/components/ui/icon-symbol';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import i18n from '@/src/infrastructure/localization/i18n';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineItemsTable } from '../components/LineItemsTable';

import { ThemedText } from '@/components/themed-text';
import { ImageViewer } from '@/src/components/ImageViewer';
import { PdfViewer } from '@/src/components/PdfViewer';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { FileDownloadService } from '../../application/FileDownloadService';
import { AttachmentService } from '../../data/AttachmentService';
import { Attachment } from '../../domain/Attachment';
import { FieldConfig, FieldStyle } from '../../domain/AttachmentTypeFields';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


// ... (existing imports)




import { AttachmentActivity } from '../components/AttachmentActivity';
import { AttachmentComments } from '../components/AttachmentComments';
import { AttachmentExport } from '../components/AttachmentExport';
import { AttachmentTags } from '../components/AttachmentTags';

export function AttachmentDetailScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    // Remove useAuth to avoid circular dependency/reference error
    const [user, setUser] = useState<{ id: string } | null>(null);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const [attachmentTypeName, setAttachmentTypeName] = useState<string | null>(null);
    const [files, setFiles] = useState<{ id?: string; url: string; contentType?: string; filename: string }[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [approvalModalVisible, setApprovalModalVisible] = useState(false);
    const [reviewerEmail, setReviewerEmail] = useState('');
    const [requestingApproval, setRequestingApproval] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(false);

    // New state for Tabs
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity' | 'export'>('details');
    const [fieldStyle, setFieldStyle] = useState<FieldStyle | null>(null);
    const [dynamicFields, setDynamicFields] = useState<FieldConfig[]>([]);
    const { setFolderCallback } = usePicker();

    const isShared = useMemo(() => {
        if (!attachment) return false;
        if (attachment.isOwner === false) return true;
        if (user && user.id !== attachment.userId) return true;
        return false;
    }, [attachment, user]);

    // ... (existing helper functions)


    useFocusEffect(
        React.useCallback(() => {
            // Fetch current user for ownership check
            import('@/src/features/auth/data/AuthService').then(({ AuthService }) => {
                AuthService.getUser().then(u => setUser(u)).catch(console.error);
            });

            if (id) {
                loadAttachment();
            }
        }, [id])
    );

    const loadAttachment = async () => {
        try {
            setLoading(true);
            const data = await AttachmentService.getAttachmentById(id!);
            setAttachment(data);

            let currentUser = user;
            if (!currentUser) {
                const { AuthService } = await import('@/src/features/auth/data/AuthService');
                currentUser = await AuthService.getUser().catch(() => null);
                if (currentUser) setUser(currentUser);
            }

            const isOwner = currentUser?.id === data.userId;

            // If not owner, try to resolve permission from folder
            if (!isOwner && data.folderId) {
                try {
                    const { FolderRepository } = await import('@/src/features/folders/infrastructure/FolderRepository');
                    const folders = await FolderRepository.getFolders();
                    const folder = folders.find(f => f.id === data.folderId);

                    if (folder && folder.permission) {
                        // Upgrade permission logic
                        const currentPerm = (data as any).permission || 'VIEW';
                        const folderPerm = folder.permission;

                        const permValue = { 'VIEW': 1, 'EDIT': 2, 'CREATE': 3, 'FULL': 4 };
                        const currentVal = permValue[currentPerm as keyof typeof permValue] || 1;
                        const folderVal = permValue[folderPerm as keyof typeof permValue] || 0;

                        if (folderVal > currentVal) {
                            // Only update if permission is different to avoid infinite loop
                            if ((data as any).permission !== folderPerm) {
                                (data as any).permission = folderPerm;
                            }
                        }
                    }
                } catch (e) {
                    console.error('Failed to resolve folder permission in detail', e);
                }
            }


            // Fetch attachment types to get configuration
            try {
                const typesResponse = await AttachmentTypeService.getAttachmentTypes();
                const types = (typesResponse as any).data || typesResponse;
                // Verify types is an array
                const typesArray = Array.isArray(types) ? types : (types as any).items || [];

                const attachmentType = typesArray.find((t: any) => t.id === data.attachmentTypeId);
                if (attachmentType) {
                    setAttachmentTypeName(attachmentType.name);

                    let fields = attachmentType.fieldConfig || [];

                    // If we have items data but no items field config, add it synthetically
                    // Web-style: Check category specific data for items
                    const category = attachmentType.category?.toLowerCase();
                    const categoryData = category ? (data as any)[category] : null;

                    if (categoryData && categoryData.items && !fields.find((f: any) => f.key === 'items')) {
                        fields = [...fields, {
                            key: 'items',
                            label: i18n.t('attachments.items.title') || 'Items',
                            type: 'array'
                        }];
                    }

                    if (fields) {
                        setDynamicFields(fields);
                    }
                    if (attachmentType.fieldStyle) {
                        setFieldStyle(attachmentType.fieldStyle);
                    }
                }
            } catch (typeErr) {
                console.error('Failed to load attachment types:', typeErr);
            }

            // Load files - backend now returns viewUrl for authenticated file access
            const fileData = await AttachmentService.getAttachmentFiles(id!);

            // Build full URLs with API base and get auth token
            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;
            setAuthToken(token || null);

            const filesWithFullUrl = fileData.map(file => ({
                id: file.id,
                url: `${OpenAPI.BASE}${file.viewUrl}`,
                contentType: file.contentType,
                filename: file.filename,
            }));

            setFiles(filesWithFullUrl);
        } catch (err) {
            console.error('Failed to load attachment:', err);
            setError('Belge yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of the file until handleRequestApproval)

    const handleShare = async () => {
        setShowActionMenu(false);
        try {
            const message = `${attachment?.title}\n${attachment?.description || ''}\n${i18n.t('receipts.detail.amount')}: ${attachment?.details?.amount ? `${attachment.details.amount} ${attachment.details.currency || 'TRY'}` : '-'}\n${i18n.t('receipts.detail.date')}: ${attachment?.documentDate ? new Date(attachment.documentDate).toLocaleDateString(i18n.locale === 'tr' ? 'tr-TR' : 'en-US') : '-'}`;

            await Share.share({
                message,
                title: attachment?.title,
            });
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    const handleEdit = () => {
        setShowActionMenu(false);
        if (isShared && attachment?.permission === 'VIEW') {
            Alert.alert(
                i18n.t('common.error'),
                i18n.t('receipts.detail.actions.error_permission')
            );
            return;
        }
        router.push(`/attachment/edit/${id}`);
    };

    const handleDownload = async () => {
        setShowActionMenu(false);
        if (files.length > 0) {
            if (files.length > 0) {
                const file = files[currentFileIndex];
                if (file) {
                    await FileDownloadService.downloadAndShare(file.url, file.filename);
                }
            }
        }
    };

    const handleDelete = () => {
        setShowActionMenu(false);
        Alert.alert(
            i18n.t('receipts.detail.actions.delete_title'),
            i18n.t('receipts.detail.actions.delete_message'),
            [
                { text: i18n.t('receipts.detail.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('receipts.detail.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeleting(true);
                            await AttachmentService.deleteAttachment(id!);
                            Alert.alert(i18n.t('common.actions.ok'), i18n.t('receipts.detail.actions.delete_success'), [
                                { text: i18n.t('common.actions.ok'), onPress: () => router.back() },
                            ]);
                        } catch (err) {
                            console.error('Failed to delete attachment:', err);
                            Alert.alert(i18n.t('receipts.detail.actions.error_delete'));
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleMoveToFolder = useCallback(() => {
        setShowActionMenu(false);
        setFolderCallback(async (folder) => {
            if (folder && attachment) {
                try {
                    await AttachmentService.updateAttachment(attachment.id, { folderId: folder.id });
                    Alert.alert(i18n.t('common.success'), i18n.t('attachments.actions.move_success'));
                    loadAttachment(); // Refresh to show new folder
                } catch (error) {
                    console.error('Failed to move attachment:', error);
                    Alert.alert(i18n.t('common.error'), i18n.t('attachments.actions.move_error'));
                }
            }
        });
        router.push('/picker/folder');
    }, [setFolderCallback, router, attachment]);

    const showMoreOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [
                        i18n.t('receipts.detail.actions.cancel'),
                        i18n.t('receipts.detail.actions.share'),
                        i18n.t('attachments.actions.move_to_folder'),
                        i18n.t('receipts.detail.actions.edit'),
                        i18n.t('common.actions.download'),
                        i18n.t('receipts.detail.actions.delete')
                    ],
                    destructiveButtonIndex: 5,
                    cancelButtonIndex: 0,
                    title: i18n.t('receipts.detail.actions.menu_title'),
                },
                (buttonIndex) => {
                    switch (buttonIndex) {
                        case 1: handleShare(); break;
                        case 2: handleMoveToFolder(); break;
                        case 3: handleEdit(); break;
                        case 4: handleDownload(); break;
                        case 5: handleDelete(); break;
                    }
                }
            );
        } else {
            setShowActionMenu(true);
        }
    };

    const [rejectionModalVisible, setRejectionModalVisible] = useState(false);

    const [rejectionReason, setRejectionReason] = useState('');
    const [processingReview, setProcessingReview] = useState(false);

    const handleRequestApproval = async () => {
        if (!reviewerEmail || !reviewerEmail.includes('@')) {
            Alert.alert(i18n.t('common.error'), i18n.t('approval.error_email'));
            return;
        }

        try {
            setRequestingApproval(true);
            await AttachmentService.postAttachmentsRequestApproval(id!, { reviewerEmail });
            setApprovalModalVisible(false);
            Alert.alert(i18n.t('common.success'), i18n.t('approval.success_request'));
            // Refresh attachment
            const updated = await AttachmentService.getAttachmentById(id!);
            setAttachment(updated);
        } catch (err) {
            Alert.alert(i18n.t('common.error'), i18n.t('approval.error_request'));
        } finally {
            setRequestingApproval(false);
        }
    };

    const handleApprove = async () => {
        try {
            setProcessingReview(true);
            await AttachmentService.patchAttachmentsStatus(id!, { status: 'APPROVED' });
            Alert.alert(i18n.t('common.success'), i18n.t('approval.success_approve'));
            const updated = await AttachmentService.getAttachmentById(id!);
            setAttachment(updated);
        } catch (err) {
            console.error(err);
            Alert.alert(i18n.t('common.error'), i18n.t('approval.error_approve'));
        } finally {
            setProcessingReview(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            Alert.alert(i18n.t('common.error'), i18n.t('approval.error_reject_reason'));
            return;
        }

        try {
            setProcessingReview(true);
            await AttachmentService.patchAttachmentsStatus(id!, { status: 'REJECTED', rejectionReason });
            setRejectionModalVisible(false);
            Alert.alert(i18n.t('common.success'), i18n.t('approval.success_reject'));
            const updated = await AttachmentService.getAttachmentById(id!);
            setAttachment(updated);
        } catch (err) {
            console.error(err);
            Alert.alert(i18n.t('common.error'), i18n.t('approval.error_reject'));
        } finally {
            setProcessingReview(false);
        }
    };

    const isImageFile = (contentType?: string) => {
        if (!contentType) return true; // Default to image if no content type
        return contentType.startsWith('image/');
    };

    const isPdfFile = (contentType?: string) => {
        return contentType === 'application/pdf';
    };

    const getFileIcon = (contentType?: string): string => {
        if (!contentType) return 'doc.fill';
        if (contentType.includes('pdf')) return 'doc.text.fill';
        if (contentType.includes('word') || contentType.includes('document')) return 'doc.richtext.fill';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'tablecells.fill';
        return 'doc.fill';
    };

    const [showImageViewer, setShowImageViewer] = useState(false);
    const [showPdfViewer, setShowPdfViewer] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ url: string; contentType?: string; filename: string } | null>(null);

    const handleOpenFile = async (file: { id?: string; url: string; contentType?: string; filename: string }) => {
        try {
            setSelectedFile(file);
            if (isImageFile(file.contentType)) {
                setShowImageViewer(true);
            } else if (isPdfFile(file.contentType)) {
                setShowPdfViewer(true);
            } else {
                // For other files, try to download and open externally directly
                await FileDownloadService.downloadAndShare(file.url, file.filename);
            }
        } catch (err) {
            console.error('Failed to open file:', err);
            Alert.alert(i18n.t('receipts.detail.actions.error_opening_file'));
        }
    };

    const handleAddFile = async () => {
        const options = [
            i18n.t('common.actions.cancel'),
            i18n.t('receipts.scan.methods.camera'),
            i18n.t('receipts.scan.methods.gallery'),
            i18n.t('receipts.scan.methods.file')
        ];

        const processFile = async (uri: string, mimeType: string = 'image/jpeg') => {
            try {
                setLoading(true);
                const result = await AttachmentService.uploadFileToAttachment(id!, { fileUri: uri, mimeType });

                // Refresh files
                const fileData = await AttachmentService.getAttachmentFiles(id!);
                const filesWithFullUrl = fileData.map(file => ({
                    id: file.id,
                    url: `${OpenAPI.BASE}${file.viewUrl}`,
                    contentType: file.contentType,
                    filename: file.filename,
                }));
                // Set index to the newly added file (last one)
                setFiles(filesWithFullUrl);
                setCurrentFileIndex(filesWithFullUrl.length - 1);
                Alert.alert(i18n.t('common.success'), i18n.t('receipts.scan.save_success.message'));
            } catch (e) {
                console.error('Upload failed', e);
                Alert.alert(i18n.t('common.error'), i18n.t('receipts.scan.save_error.message'));
            } finally {
                setLoading(false);
            }
        };

        const handlePickImage = async (source: 'camera' | 'library') => {
            const { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions } = await import('expo-image-picker');
            const result = source === 'camera'
                ? await launchCameraAsync({ mediaTypes: MediaTypeOptions.Images, quality: 0.8 })
                : await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images, quality: 0.8 });

            if (!result.canceled && result.assets[0]) {
                await processFile(result.assets[0].uri, result.assets[0].mimeType);
            }
        };

        const handlePickDoc = async () => {
            const { getDocumentAsync } = await import('expo-document-picker');
            const result = await getDocumentAsync({ type: '*/*' });
            if (!result.canceled && result.assets && result.assets[0]) {
                await processFile(result.assets[0].uri, result.assets[0].mimeType);
            }
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions({
                options,
                cancelButtonIndex: 0
            }, (buttonIndex) => {
                if (buttonIndex === 1) handlePickImage('camera');
                if (buttonIndex === 2) handlePickImage('library');
                if (buttonIndex === 3) handlePickDoc();
            });
        } else {
            Alert.alert(
                i18n.t('attachments.addFile'),
                undefined,
                [
                    { text: i18n.t('receipts.scan.methods.camera'), onPress: () => handlePickImage('camera') },
                    { text: i18n.t('receipts.scan.methods.gallery'), onPress: () => handlePickImage('library') },
                    { text: i18n.t('receipts.scan.methods.file'), onPress: handlePickDoc },
                    { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                ]
            );
        }
    };

    const handleDeleteFile = async () => {
        const file = files[currentFileIndex];
        if (!file || !file.id) return;

        Alert.alert(
            i18n.t('receipts.detail.actions.delete_title'),
            i18n.t('attachments.deleteConfirmation') || 'Are you sure you want to delete this file?',
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await AttachmentService.deleteFile(file.id!);

                            const newFiles = files.filter(f => f.id !== file.id);
                            setFiles(newFiles);
                            if (currentFileIndex >= newFiles.length) {
                                setCurrentFileIndex(Math.max(0, newFiles.length - 1));
                            }

                            Alert.alert(i18n.t('common.success'), 'Dosya silindi.');
                        } catch (e) {
                            console.error('Delete file failed', e);
                            Alert.alert(i18n.t('common.error'), i18n.t('receipts.detail.actions.error_delete'));
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        tabBarContainer: {
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        tabBar: {
            flexDirection: 'row',
            paddingHorizontal: 4,
        },
        tabItem: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 2,
            borderBottomColor: 'transparent',
            minWidth: 80,
        },
        activeTabItem: {
            borderBottomColor: colors.primary,
        },
        tabText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textLight,
        },
        activeTabText: {
            color: colors.primary,
        },
        tabContent: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
        },
        errorText: {
            color: colors.textLight,
            fontSize: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        backButton: {
            padding: 8,
            marginLeft: -8,
        },
        headerTitle: {
            fontSize: 18,
            color: colors.text,
        },
        menuButton: {
            padding: 8,
            marginRight: -8,
        },
        content: {
            flex: 1,
        },
        imageContainer: {
            backgroundColor: colors.card,
            padding: 16,
            marginBottom: 12,
        },
        mainImage: {
            width: '100%',
            height: 300,
            borderRadius: 12,
            backgroundColor: colors.surface,
        },
        thumbnailRow: {
            flexDirection: 'row',
            marginTop: 12,
            gap: 8,
        },
        thumbnail: {
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: colors.surface,
        },
        moreThumbnail: {
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
        },
        moreText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textLight,
        },
        mainDocumentContainer: {
            width: '100%',
            height: 300,
            borderRadius: 12,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        thumbnailDocumentContainer: {
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: colors.background, // was backgroundLight, using background for now
            justifyContent: 'center',
            alignItems: 'center',
        },
        documentFilename: {
            fontSize: 14,
            color: colors.text,
            marginTop: 12,
            textAlign: 'center',
        },
        documentHint: {
            fontSize: 12,
            color: colors.textLight,
            marginTop: 8,
        },
        noImageContainer: {
            backgroundColor: colors.card,
            padding: 32,
            marginBottom: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        noImageText: {
            marginTop: 8,
            color: colors.textLight,
            fontSize: 14,
        },
        card: {
            backgroundColor: colors.card,
            padding: 16,
            marginBottom: 12,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        iconBadge: {
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
        },
        titleInfo: {
            flex: 1,
        },
        title: {
            fontSize: 20,
            color: colors.text,
        },
        date: {
            fontSize: 14,
            color: colors.textLight,
            marginTop: 2,
        },
        amountContainer: {
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        amountLabel: {
            fontSize: 14,
            color: colors.textLight,
        },
        amount: {
            fontSize: 28,
            color: colors.primary,
            fontWeight: '700',
        },
        sectionTitle: {
            fontSize: 16,
            color: colors.text,
            marginBottom: 12,
            fontWeight: '600',
        },
        detailRow: {
            marginBottom: 16,
        },
        detailItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        detailText: {
            flex: 1,
        },
        detailLabel: {
            fontSize: 12,
            color: colors.textLight,
            marginBottom: 2,
        },
        detailIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.card,
        },
        detailValue: {
            fontSize: 15,
            color: colors.text,
        },
        descriptionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        descriptionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        description: {
            fontSize: 15,
            color: colors.text, // Updated to use theme color
            lineHeight: 22,
        },
        expandText: {
            color: colors.primary,
            fontSize: 14,
            marginTop: 8,
            fontWeight: '600',
        },
        actionsContainer: {
            padding: 16,
            gap: 12,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            gap: 8,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        actionText: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '600',
        },
        deleteButton: {
            borderColor: colors.error + '40',
            backgroundColor: colors.error + '05',
        },
        deleteText: {
            color: colors.error,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        actionMenuContainer: {
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            gap: 16,
        },
        actionMenuTitle: {
            fontSize: 18,
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        actionMenuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.background,
            borderRadius: 12,
            gap: 12,
        },
        actionMenuText: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '600',
        },
        deleteMenuItem: {
            backgroundColor: colors.error + '10',
        },
        cancelMenuItem: {
            marginTop: 8,
            justifyContent: 'center',
            backgroundColor: 'transparent',
        },
        cancelText: {
            fontSize: 16,
            color: colors.gray,
            fontWeight: '600',
            textAlign: 'center',
        },
        viewHintContainer: {
            position: 'absolute',
            bottom: 12,
            right: 12,
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
        },
        viewHintText: {
            color: 'white',
            fontSize: 13,
            fontWeight: '600',
        },
        // Line Items Styles
        lineItemsContainer: {
            marginTop: 4,
            width: '100%',
        },
        lineItemsHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        lineItemsContent: {
            marginTop: 8,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
        },
        badge: {
            backgroundColor: colors.primary + '15',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        badgeText: {
            color: colors.primary,
            fontSize: 12,
            fontWeight: '600',
        },
        tableHeader: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 8,
            marginBottom: 8,
        },
        tableHeaderText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textLight,
        },
        tableRow: {
            flexDirection: 'row',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '40',
        },
        tableCell: {
            fontSize: 13,
            color: colors.text,
        },
    }), [colors]);

    const renderFilePreview = (file: { url: string; contentType?: string; filename: string }, isMain: boolean) => {
        if (isImageFile(file.contentType)) {
            // Image file - show preview using expo-image with auth headers
            return (
                <TouchableOpacity onPress={() => handleOpenFile(file)} activeOpacity={0.9}>
                    <Image
                        source={{
                            uri: file.url,
                            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined,
                        }}
                        style={isMain ? styles.mainImage : styles.thumbnail}
                        contentFit="cover"
                        onError={(e) => console.log('Image load error:', e)}
                    />
                    {isMain && (
                        <View style={styles.viewHintContainer}>
                            <IconSymbol name="arrow.up.left.and.arrow.down.right" size={14} color="white" />
                            <ThemedText style={styles.viewHintText}>{i18n.t('receipts.detail.actions.open_hint')}</ThemedText>
                        </View>
                    )}
                </TouchableOpacity>
            );
        } else {
            // Document file (PDF, Word, Excel, etc.) - show icon with tap to open
            return (
                <TouchableOpacity
                    style={[
                        isMain ? styles.mainDocumentContainer : styles.thumbnailDocumentContainer,
                        { backgroundColor: colors.background }
                    ]}
                    onPress={() => handleOpenFile(file)}
                    activeOpacity={0.7}
                >
                    <IconSymbol
                        name={getFileIcon(file.contentType) as any}
                        size={isMain ? 64 : 28}
                        color={colors.primary}
                    />
                    {isMain && (
                        <ThemedText style={styles.documentFilename} numberOfLines={2}>
                            {file.filename}
                        </ThemedText>
                    )}
                    {isMain && (
                        <ThemedText style={styles.documentHint}>{i18n.t('receipts.detail.actions.open_hint')}</ThemedText>
                    )}
                </TouchableOpacity>
            );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.locale === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number | null, currency: string | null) => {
        if (amount === null) return '-';
        return new Intl.NumberFormat(i18n.locale === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: currency || 'TRY',
        }).format(amount);
    };

    const getTypeIcon = (typeId: string) => {
        // Map type IDs to icons - you can expand this
        const iconMap: Record<string, string> = {
            'invoice': 'doc.text.fill',
            'receipt': 'receipt',
            'contract': 'doc.on.doc.fill',
            'warranty': 'shield.fill',
        };
        return iconMap[typeId] || 'doc.fill';
    };

    const getFieldIcon = (fieldKey: string): string => {
        const iconMap: Record<string, string> = {
            warrantyDuration: 'clock.fill',
            warrantyEndDate: 'calendar.badge.clock',
            warrantyProvider: 'building.2.fill',
            serialNumber: 'barcode',
            productName: 'shippingbox.fill',
            subscriptionEndDate: 'calendar.badge.exclamationmark',
            renewalType: 'arrow.triangle.2.circlepath',
            provider: 'building.2.fill',
            policyNumber: 'number',
            expiryDate: 'calendar.badge.exclamationmark',
            coverage: 'checkmark.shield.fill',
            vehiclePlate: 'car.fill',
            vehicleModel: 'car.side.fill',
            contractNumber: 'doc.text.fill',
            startDate: 'calendar',
            endDate: 'calendar.badge.clock',
            party: 'person.2.fill',
            doctorName: 'stethoscope',
            hospital: 'cross.fill',
            diagnosis: 'heart.text.square.fill',
        };
        return iconMap[fieldKey] || 'info.circle.fill';
    };

    const formatFieldValue = (field: FieldConfig, value: any): string => {
        if (value === null || value === undefined) return '-';

        switch (field.type) {
            case 'date':
                return formatDate(value);
            case 'currency':
                return formatCurrency(value, attachment?.details?.currency || 'TRY');
            case 'duration':
                const unit = attachment?.details?.[`${field.key}Unit`] || field.unit || 'month';
                // Using i18n for units
                return `${value} ${i18n.t(`common.units.${unit}` as any)}`;
            default:
                return String(value);
        }
    };







    const renderTypeSpecificFields = () => {
        if (!attachment) return null;

        // Helper to get value securely
        // Helper to get value securely, handling category-specific paths (Web-style)
        const getValue = (key: string) => {
            // 1. Check direct details
            let val = attachment.details?.[key];

            // 2. Check category specific object (e.g. financial, personnel) if not found
            // Cast to any because attachmentType might not be fully typed in the base interface but is populated
            const att = attachment as any;
            if (val === undefined && att.attachmentType?.category) {
                const category = att.attachmentType.category.toLowerCase();
                const categoryData = att[category];
                if (categoryData) {
                    val = categoryData[key];
                }
            }

            // 3. Fallback to root (e.g. amount, currency)
            if (val === undefined && key in attachment) {
                val = (attachment as any)[key];
            }
            return val;
        };

        const renderFieldItem = (key: string, label: string, flex = 1) => {
            const field = dynamicFields.find(f => f.key === key);
            // If field config exists use it, otherwise fallback
            const finalLabel = field ? field.label : label;
            const val = getValue(key);

            // Handle Line Items (Array of Objects)
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                // Get config directly from fieldStyle (like web) or current field config
                const itemsConfig = fieldStyle?.items || field?.items;
                return (
                    <View key={key} style={{ width: '100%', marginTop: 8 }}>
                        <LineItemsTable
                            items={val}
                            label={finalLabel}
                            currency={attachment?.details?.currency || 'TRY'}
                            itemsConfig={itemsConfig}
                        />
                    </View>
                );
            }

            const displayVal = field ? formatFieldValue(field, val) : val;

            return (
                <View key={key} style={[styles.detailItem, { flex, backgroundColor: colors.card, marginBottom: 0 }]}>
                    <View style={styles.detailIcon}>
                        <IconSymbol name={getFieldIcon(key) as any} size={18} color={colors.textLight} />
                    </View>
                    <View style={styles.detailText}>
                        <ThemedText style={styles.detailLabel}>{finalLabel}</ThemedText>
                        <ThemedText style={styles.detailValue}>
                            {displayVal ?? '-'}
                        </ThemedText>
                    </View>
                </View>
            );
        };

        if (fieldStyle?.mobile?.gridTemplateAreas) {
            const rows = fieldStyle.mobile.gridTemplateAreas.map(rowStr => {
                return rowStr.replace(/['"]+/g, '').trim().split(/\s+/);
            });

            return (
                <View style={{ gap: 12 }}>
                    {rows.map((rowKeys, rowIndex) => (
                        <View key={rowIndex} style={{ flexDirection: 'row', gap: 12 }}>
                            {rowKeys.map((key, colIndex) => {
                                // Skip if handled by span
                                if (colIndex > 0 && key === rowKeys[colIndex - 1]) return null;

                                // Calculate span
                                let span = 1;
                                for (let i = colIndex + 1; i < rowKeys.length; i++) {
                                    if (rowKeys[i] === key) span++;
                                    else break;
                                }

                                const field = dynamicFields.find(f => f.key === key);
                                const label = field ? field.label : key.charAt(0).toUpperCase() + key.slice(1);

                                return renderFieldItem(key, label, span);
                            })}
                        </View>
                    ))}
                </View>
            );
        }

        // Fallback: Vertical list
        const fields = dynamicFields;
        if (fields.length === 0) return null;

        return (
            <View style={{ gap: 12 }}>
                {fields.map(field => renderFieldItem(field.key, field.label, 0))}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !attachment) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
                    <ThemedText style={styles.errorText}>{error || i18n.t('receipts.detail.actions.error_load')}</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>{i18n.t('receipts.detail.title')}</ThemedText>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>


                    <TouchableOpacity style={styles.menuButton} onPress={showMoreOptions}>
                        <IconSymbol name="ellipsis" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBarContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBar}
                >
                    {(['details', 'comments', 'activity', 'export'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <ThemedText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {i18n.t(`tabs.${tab}` as any) || tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
                {activeTab === 'details' && (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* File Gallery */}
                        {/* File Gallery */}
                        {files.length > 0 ? (
                            <View style={{ position: 'relative', marginBottom: 12 }}>
                                <TouchableOpacity
                                    onPress={() => handleOpenFile(files[currentFileIndex])}
                                    testID="attachment-preview"
                                    activeOpacity={0.9}
                                >
                                    {isImageFile(files[currentFileIndex].contentType) ? (
                                        <View style={styles.imageContainer}>
                                            <Image
                                                source={{
                                                    uri: files[currentFileIndex].url,
                                                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
                                                }}
                                                style={styles.mainImage}
                                                contentFit="contain"
                                                transition={200}
                                            />
                                        </View>
                                    ) : (
                                        <View style={styles.noImageContainer}>
                                            <View style={[styles.mainDocumentContainer, { height: 300, backgroundColor: colors.background }]}>
                                                <IconSymbol
                                                    name={getFileIcon(files[currentFileIndex].contentType) as any}
                                                    size={64}
                                                    color={colors.primary}
                                                />
                                                <ThemedText style={styles.documentFilename} numberOfLines={1}>{files[currentFileIndex].filename}</ThemedText>
                                                <ThemedText style={styles.documentHint}>{i18n.t('common.actions.tapToView')}</ThemedText>
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* File Navigation & Actions Overlay */}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    backgroundColor: colors.card,
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border,
                                    borderTopWidth: 1,
                                    borderTopColor: colors.border,
                                    marginTop: -12
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        {files.length > 1 && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                <TouchableOpacity
                                                    onPress={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                                                    disabled={currentFileIndex === 0}
                                                    style={{ opacity: currentFileIndex === 0 ? 0.3 : 1, padding: 8 }}
                                                >
                                                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                                                </TouchableOpacity>
                                                <ThemedText style={{ fontSize: 14, fontWeight: '500', minWidth: 40, textAlign: 'center' }}>
                                                    {currentFileIndex + 1} / {files.length}
                                                </ThemedText>
                                                <TouchableOpacity
                                                    onPress={() => setCurrentFileIndex(prev => Math.min(files.length - 1, prev + 1))}
                                                    disabled={currentFileIndex === files.length - 1}
                                                    style={{ opacity: currentFileIndex === files.length - 1 ? 0.3 : 1, padding: 8 }}
                                                >
                                                    <IconSymbol name="chevron.right" size={24} color={colors.text} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 16 }}>
                                        {(!isShared || attachment?.permission !== 'VIEW') && (
                                            <>
                                                <TouchableOpacity
                                                    onPress={handleDeleteFile}
                                                    style={{ padding: 8, backgroundColor: colors.error + '15', borderRadius: 8 }}
                                                >
                                                    <IconSymbol name="trash" size={20} color={colors.error} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={handleAddFile}
                                                    style={{ padding: 8, backgroundColor: colors.primary + '15', borderRadius: 8 }}
                                                >
                                                    <IconSymbol name="plus" size={20} color={colors.primary} />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.noImageContainer}>
                                <IconSymbol name="photo" size={48} color={colors.textLight} />
                                <ThemedText style={styles.noImageText}>{i18n.t('receipts.detail.actions.no_file') || 'Dosya yok'}</ThemedText>
                                {(!isShared || attachment?.permission !== 'VIEW') && (
                                    <TouchableOpacity
                                        onPress={handleAddFile}
                                        style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: colors.primary + '15', borderRadius: 8 }}
                                    >
                                        <IconSymbol name="plus" size={16} color={colors.primary} />
                                        <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>
                                            {i18n.t('attachments.addFile') || 'Dosya Ekle'}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Title & Amount Card */}
                        <View style={styles.card}>
                            <View style={styles.titleRow}>
                                <View style={styles.iconBadge}>
                                    <IconSymbol
                                        name={getTypeIcon(attachment.attachmentTypeId) as any}
                                        size={24}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={styles.titleInfo}>
                                    <ThemedText type="title" style={styles.title}>{attachment.title}</ThemedText>
                                    <ThemedText style={styles.date}>{formatDate(attachment.documentDate)}</ThemedText>

                                    {/* Status Badge */}
                                    {attachment.status && (
                                        <View style={{
                                            backgroundColor: attachment.status === 'APPROVED' ? colors.success + '15' :
                                                attachment.status === 'REJECTED' ? colors.error + '15' : '#FF980015',
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            alignSelf: 'flex-start',
                                            marginTop: 8,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 4
                                        }}>
                                            <IconSymbol
                                                name={attachment.status === 'APPROVED' ? 'checkmark.circle.fill' :
                                                    attachment.status === 'REJECTED' ? 'xmark.circle.fill' : 'clock.fill'}
                                                size={12}
                                                color={attachment.status === 'APPROVED' ? colors.success :
                                                    attachment.status === 'REJECTED' ? colors.error : '#FF9800'}
                                            />
                                            <ThemedText style={{
                                                fontSize: 12,
                                                color: attachment.status === 'APPROVED' ? colors.success :
                                                    attachment.status === 'REJECTED' ? colors.error : '#FF9800',
                                                fontWeight: '600'
                                            }}>
                                                {attachment.status === 'APPROVED' ? 'Onaylandı' :
                                                    attachment.status === 'REJECTED' ? 'Reddedildi' : 'Onay Bekliyor'}
                                            </ThemedText>
                                        </View>
                                    )}

                                    {/* Shared Badge */}
                                    {isShared && (
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                            <View style={{
                                                backgroundColor: colors.primary + '15',
                                                paddingHorizontal: 8,
                                                paddingVertical: 4,
                                                borderRadius: 6,
                                                alignSelf: 'flex-start',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 4
                                            }}>
                                                <IconSymbol name="person.2.fill" size={12} color={colors.primary} />
                                                <ThemedText style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
                                                    {i18n.t('folders.picker.shared_badge')}
                                                </ThemedText>
                                            </View>

                                            {/* Permission Badge */}
                                            <View style={{
                                                backgroundColor: (attachment.permission && attachment.permission !== 'VIEW') ? colors.success + '15' : colors.textLight + '15',
                                                paddingHorizontal: 8,
                                                paddingVertical: 4,
                                                borderRadius: 6,
                                                alignSelf: 'flex-start'
                                            }}>
                                                <ThemedText style={{
                                                    fontSize: 12,
                                                    color: (attachment.permission && attachment.permission !== 'VIEW') ? colors.success : colors.textLight,
                                                    fontWeight: '600'
                                                }}>
                                                    {(attachment.permission && attachment.permission !== 'VIEW')
                                                        ? i18n.t('folders.picker.permissions.edit')
                                                        : i18n.t('folders.picker.permissions.view')}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Tags Component */}
                            <AttachmentTags
                                attachmentId={id!}
                                onTagsUpdate={() => loadAttachment()} // Reload to refresh tags if needed, or handle locally
                            />

                            {/* Type-specific fields */}
                            {renderTypeSpecificFields()}
                        </View>

                        {/* Actions */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    if (files.length > 0 && files[0].url) {
                                        Share.share({
                                            url: files[0].url,
                                            title: attachment.title,
                                        });
                                    } else {
                                        Alert.alert(i18n.t('common.error'), i18n.t('receipts.detail.actions.no_file'));
                                    }
                                }}
                            >
                                <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
                                <ThemedText style={styles.actionText}>{i18n.t('receipts.detail.actions.share')}</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    (isShared && attachment.permission === 'VIEW') && { opacity: 0.5 }
                                ]}
                                onPress={() => {
                                    if (isShared && attachment.permission === 'VIEW') {
                                        Alert.alert(
                                            i18n.t('common.error'),
                                            i18n.t('receipts.detail.actions.error_permission')
                                        );
                                        return;
                                    }
                                    router.push(`/attachment/edit/${attachment.id}`);
                                }}
                            >
                                <IconSymbol name="pencil" size={20} color={colors.primary} />
                                <ThemedText style={styles.actionText}>{i18n.t('receipts.detail.actions.edit')}</ThemedText>
                            </TouchableOpacity>

                            {attachment.permissions?.canRequestApproval && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => setApprovalModalVisible(true)}
                                >
                                    <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                                    <ThemedText style={styles.actionText}>{i18n.t('approval.request_button')}</ThemedText>
                                </TouchableOpacity>
                            )}

                            {attachment.permissions?.canApprove && (
                                <>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { borderColor: colors.success, backgroundColor: colors.success + '10' }]}
                                        onPress={() => Alert.alert(
                                            i18n.t('approval.confirm_approve_title'),
                                            i18n.t('approval.confirm_approve_message'),
                                            [
                                                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                                                { text: i18n.t('approval.approve_button'), onPress: handleApprove, style: 'default' }
                                            ]
                                        )}
                                        disabled={processingReview}
                                    >
                                        {processingReview ? (
                                            <ActivityIndicator size="small" color={colors.success} />
                                        ) : (
                                            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                                        )}
                                        <ThemedText style={[styles.actionText, { color: colors.success }]}>{i18n.t('approval.approve_button')}</ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, { borderColor: colors.error, backgroundColor: colors.error + '10' }]}
                                        onPress={() => setRejectionModalVisible(true)}
                                        disabled={processingReview}
                                    >
                                        <IconSymbol name="xmark.circle.fill" size={20} color={colors.error} />
                                        <ThemedText style={[styles.actionText, { color: colors.error }]}>{i18n.t('approval.reject_button')}</ThemedText>
                                    </TouchableOpacity>
                                </>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    styles.deleteButton,
                                    (!isShared || attachment.permission === 'FULL') ? {} : { opacity: 0.5 }
                                ]}
                                onPress={() => {
                                    if (isShared && attachment.permission !== 'FULL') {
                                        Alert.alert(
                                            i18n.t('common.error'),
                                            i18n.t('receipts.detail.actions.error_permission')
                                        );
                                        return;
                                    }
                                    handleDelete();
                                }}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color={colors.error} />
                                ) : (
                                    <IconSymbol name="trash" size={20} color={colors.error} />
                                )}
                                <ThemedText style={[styles.actionText, styles.deleteText]}>{i18n.t('receipts.detail.actions.delete')}</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}

                {activeTab === 'comments' && (
                    <AttachmentComments attachmentId={id!} currentUserId={user?.id} />
                )}

                {activeTab === 'activity' && (
                    <AttachmentActivity attachmentId={id!} />
                )}

                {activeTab === 'export' && (
                    <AttachmentExport
                        attachmentId={id!}
                        fieldConfig={dynamicFields}
                    />
                )}
            </View>

            {/* Android Action Menu Modal */}
            <Modal
                visible={showActionMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowActionMenu(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowActionMenu(false)}>
                    <View style={styles.actionMenuContainer}>
                        <ThemedText type="subtitle" style={styles.actionMenuTitle}>{i18n.t('receipts.detail.actions.menu_title')}</ThemedText>

                        <TouchableOpacity style={styles.actionMenuItem} onPress={handleShare}>
                            <IconSymbol name="square.and.arrow.up" size={22} color={colors.text} />
                            <ThemedText style={styles.actionMenuText}>{i18n.t('receipts.detail.actions.share')}</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionMenuItem} onPress={handleMoveToFolder}>
                            <IconSymbol name="folder" size={22} color={colors.text} />
                            <ThemedText style={styles.actionMenuText}>{i18n.t('attachments.actions.move_to_folder')}</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionMenuItem} onPress={handleDownload}>
                            <IconSymbol name="arrow.down.circle" size={22} color={colors.text} />
                            <ThemedText style={styles.actionMenuText}>{i18n.t('common.actions.download')}</ThemedText>
                        </TouchableOpacity>

                        {attachment?.permission !== 'VIEW' && (
                            <TouchableOpacity style={styles.actionMenuItem} onPress={handleEdit}>
                                <IconSymbol name="pencil" size={22} color={colors.text} />
                                <ThemedText style={styles.actionMenuText}>{i18n.t('receipts.detail.actions.edit')}</ThemedText>
                            </TouchableOpacity>
                        )}

                        {(attachment?.permission === 'FULL' || attachment?.isOwner) && (
                            <TouchableOpacity style={[styles.actionMenuItem, styles.deleteMenuItem]} onPress={() => { handleDelete(); setShowActionMenu(false); }}>
                                <IconSymbol name="trash" size={22} color={colors.error} />
                                <ThemedText style={[styles.actionMenuText, styles.deleteText]}>{i18n.t('receipts.detail.actions.delete')}</ThemedText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.actionMenuItem, styles.cancelMenuItem]} onPress={() => setShowActionMenu(false)}>
                            <ThemedText style={styles.cancelText}>{i18n.t('common.actions.cancel')}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {selectedFile && (
                <>
                    <ImageViewer
                        visible={showImageViewer}
                        onClose={() => setShowImageViewer(false)}
                        url={selectedFile.url}
                        filename={selectedFile.filename}
                        headers={authToken ? { Authorization: `Bearer ${authToken}` } : undefined}
                    />
                    <PdfViewer
                        visible={showPdfViewer}
                        onClose={() => setShowPdfViewer(false)}
                        url={selectedFile.url}
                        filename={selectedFile.filename}
                        headers={authToken ? { Authorization: `Bearer ${authToken}` } : undefined}
                    />
                </>
            )}

            <Modal
                visible={approvalModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setApprovalModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 12, width: '80%' }}>
                        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>{i18n.t('approval.request_modal_title')}</ThemedText>
                        <ThemedText style={{ marginBottom: 8 }}>{i18n.t('approval.reviewer_email')}:</ThemedText>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 16,
                                color: colors.text,
                                backgroundColor: colors.background
                            }}
                            value={reviewerEmail}
                            onChangeText={setReviewerEmail}
                            placeholder={i18n.t('approval.reviewer_placeholder')}
                            placeholderTextColor={colors.subtext}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                            <TouchableOpacity onPress={() => setApprovalModalVisible(false)}>
                                <ThemedText style={{ color: colors.subtext }}>{i18n.t('common.actions.cancel')}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRequestApproval} disabled={requestingApproval}>
                                {requestingApproval ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <ThemedText style={{ color: colors.primary, fontWeight: 'bold' }}>{i18n.t('approval.send')}</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={rejectionModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setRejectionModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 12, width: '80%' }}>
                        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>{i18n.t('approval.reject_modal_title')}</ThemedText>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 16,
                                color: colors.text,
                                backgroundColor: colors.background,
                                minHeight: 80,
                                textAlignVertical: 'top'
                            }}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            placeholder={i18n.t('approval.reject_placeholder')}
                            placeholderTextColor={colors.subtext}
                            multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                            <TouchableOpacity onPress={() => setRejectionModalVisible(false)}>
                                <ThemedText style={{ color: colors.subtext }}>{i18n.t('common.actions.cancel')}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleReject} disabled={processingReview}>
                                {processingReview ? (
                                    <ActivityIndicator size="small" color={colors.error} />
                                ) : (
                                    <ThemedText style={{ color: colors.error, fontWeight: 'bold' }}>{i18n.t('approval.reject_button')}</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


        </SafeAreaView>
    );
}
