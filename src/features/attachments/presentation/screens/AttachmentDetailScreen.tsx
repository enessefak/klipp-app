import { IconSymbol } from '@/components/ui/icon-symbol';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import i18n from '@/src/infrastructure/localization/i18n';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import { AttachmentService } from '../../data/AttachmentService';
import { Attachment } from '../../domain/Attachment';
import { FieldConfig } from '../../domain/AttachmentTypeFields';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function AttachmentDetailScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    // Remove useAuth to avoid circular dependency/reference error
    const [user, setUser] = useState<{ id: string } | null>(null);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const [attachmentTypeName, setAttachmentTypeName] = useState<string | null>(null);
    const [files, setFiles] = useState<{ url: string; contentType?: string; filename: string }[]>([]);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(false);

    const isShared = useMemo(() => {
        if (!attachment) return false;
        if (attachment.isOwner === false) return true;
        if (user && user.id !== attachment.userId) return true;
        return false;
    }, [attachment, user]);

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

            console.log('DEBUG: Attachment loaded:', {
                id: data.id,
                owner: data.isOwner,
                perm: data.permission,
                folderId: data.folderId
            });

            // Resolve current user to check ownership reliably
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
                            (data as any).permission = folderPerm;
                            setAttachment({ ...data });
                        }
                    }
                } catch (e) {
                    console.error('Failed to resolve folder permission in detail', e);
                }
            }

            // Fetch attachment types to get configuration
            try {
                const types = await AttachmentTypeService.getAttachmentTypes();
                const attachmentType = types.find(t => t.id === data.attachmentTypeId);
                console.log('DEBUG: Found attachment type:', attachmentType);
                if (attachmentType) {
                    setAttachmentTypeName(attachmentType.name);
                    if (attachmentType.fieldConfig) {
                        setDynamicFields(attachmentType.fieldConfig);
                    }
                }
            } catch (typeErr) {
                console.error('Failed to load attachment types:', typeErr);
            }

            // Load files - backend now returns viewUrl for authenticated file access
            const fileData = await AttachmentService.getAttachmentFiles(id!);
            console.log('Loaded files for attachment:', id, fileData);

            // Build full URLs with API base and get auth token
            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;
            setAuthToken(token || null);

            const filesWithFullUrl = fileData.map(file => ({
                url: `${OpenAPI.BASE}${file.viewUrl}`,
                contentType: file.contentType,
                filename: file.filename,
            }));

            console.log('File URLs with base:', filesWithFullUrl);
            setFiles(filesWithFullUrl);
        } catch (err) {
            console.error('Failed to load attachment:', err);
            setError('Belge yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

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

    const showMoreOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [
                        i18n.t('receipts.detail.actions.cancel'),
                        i18n.t('receipts.detail.actions.share'),
                        i18n.t('receipts.detail.actions.edit'),
                        i18n.t('receipts.detail.actions.delete')
                    ],
                    destructiveButtonIndex: 3,
                    cancelButtonIndex: 0,
                    title: i18n.t('receipts.detail.actions.menu_title'),
                },
                (buttonIndex) => {
                    switch (buttonIndex) {
                        case 1:
                            handleShare();
                            break;
                        case 2:
                            handleEdit();
                            break;
                        case 3:
                            handleDelete();
                            break;
                    }
                }
            );
        } else {
            setShowActionMenu(true);
        }
    };

    const handleDelete = () => {
        setShowActionMenu(false);
        Alert.alert(
            i18n.t('receipts.detail.actions.delete_title'),
            i18n.t('receipts.detail.actions.delete_message'),
            [
                {
                    text: i18n.t('receipts.detail.actions.cancel'),
                    style: 'cancel',
                },
                {
                    text: i18n.t('receipts.detail.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeleting(true);
                            await AttachmentService.deleteAttachment(id!);
                            Alert.alert(i18n.t('common.actions.ok'), i18n.t('receipts.detail.actions.delete_success'), [
                                {
                                    text: i18n.t('common.actions.ok'),
                                    onPress: () => router.back(),
                                },
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

    const handleOpenFile = async (file: { url: string; contentType?: string; filename: string }) => {
        try {
            // For non-image files, open in browser/external viewer
            const supported = await Linking.canOpenURL(file.url);
            if (supported) {
                await Linking.openURL(file.url);
            } else {
                Alert.alert(i18n.t('receipts.detail.actions.cannot_open_file'));
            }
        } catch (err) {
            console.error('Failed to open file:', err);
            Alert.alert(i18n.t('receipts.detail.actions.error_opening_file'));
        }
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
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
    }), [colors]);

    const renderFilePreview = (file: { url: string; contentType?: string; filename: string }, isMain: boolean) => {
        if (isImageFile(file.contentType)) {
            // Image file - show preview using expo-image with auth headers
            return (
                <Image
                    source={{
                        uri: file.url,
                        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined,
                    }}
                    style={isMain ? styles.mainImage : styles.thumbnail}
                    contentFit="cover"
                    onError={(e) => console.log('Image load error:', e)}
                />
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

    const [dynamicFields, setDynamicFields] = useState<FieldConfig[]>([]);



    const renderTypeSpecificFields = () => {
        const fields = dynamicFields;
        console.log('Fields for type:', fields);

        if (fields.length === 0) {
            console.log('No fields defined for this type');
            return null;
        }

        // Show all fields, even if details is empty
        if (!attachment?.details) {
            console.log('No details object, showing empty field values');
            return fields.map((field) => (
                <View key={field.key} style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <IconSymbol name={getFieldIcon(field.key) as any} size={18} color={colors.textLight} />
                        <View style={styles.detailText}>
                            <ThemedText style={styles.detailLabel}>{field.label}</ThemedText>
                            <ThemedText style={styles.detailValue}>-</ThemedText>
                        </View>
                    </View>
                </View>
            ));
        }

        const fieldsWithValues = fields.filter(field =>
            attachment.details?.[field.key] !== null &&
            attachment.details?.[field.key] !== undefined
        );
        console.log('Fields with values:', fieldsWithValues);

        if (fieldsWithValues.length === 0) {
            console.log('No fields have values, showing all fields with empty values');
            return fields.map((field) => (
                <View key={field.key} style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <IconSymbol name={getFieldIcon(field.key) as any} size={18} color={colors.textLight} />
                        <View style={styles.detailText}>
                            <ThemedText style={styles.detailLabel}>{field.label}</ThemedText>
                            <ThemedText style={styles.detailValue}>-</ThemedText>
                        </View>
                    </View>
                </View>
            ));
        }

        return fieldsWithValues.map((field) => (
            <View key={field.key} style={styles.detailRow}>
                <View style={styles.detailItem}>
                    <IconSymbol name={getFieldIcon(field.key) as any} size={18} color={colors.textLight} />
                    <View style={styles.detailText}>
                        <ThemedText style={styles.detailLabel}>{field.label}</ThemedText>
                        <ThemedText style={styles.detailValue}>
                            {formatFieldValue(field, attachment.details?.[field.key])}
                        </ThemedText>
                    </View>
                </View>
            </View>
        ));
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
                <TouchableOpacity style={styles.menuButton} onPress={showMoreOptions}>
                    <IconSymbol name="ellipsis" size={24} color={colors.text} />
                </TouchableOpacity>
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

                        {attachment?.permission !== 'VIEW' && (
                            <TouchableOpacity style={styles.actionMenuItem} onPress={handleEdit}>
                                <IconSymbol name="pencil" size={22} color={colors.text} />
                                <ThemedText style={styles.actionMenuText}>{i18n.t('receipts.detail.actions.edit')}</ThemedText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.actionMenuItem, styles.deleteMenuItem]} onPress={handleDelete}>
                            <IconSymbol name="trash" size={22} color={colors.error} />
                            <ThemedText style={[styles.actionMenuText, { color: colors.error }]}>{i18n.t('receipts.detail.actions.delete')}</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionMenuItem, styles.cancelMenuItem]}
                            onPress={() => setShowActionMenu(false)}
                        >
                            <ThemedText style={styles.cancelText}>{i18n.t('receipts.detail.actions.cancel')}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* File Gallery */}
                {files.length > 0 ? (
                    <View style={styles.imageContainer}>
                        {renderFilePreview(files[0], true)}
                        {files.length > 1 && (
                            <View style={styles.thumbnailRow}>
                                {files.slice(1, 4).map((file, index) => (
                                    <View key={index}>
                                        {renderFilePreview(file, false)}
                                    </View>
                                ))}
                                {files.length > 4 && (
                                    <View style={styles.moreThumbnail}>
                                        <ThemedText style={styles.moreText}>+{files.length - 4}</ThemedText>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.noImageContainer}>
                        <IconSymbol name="photo" size={48} color={colors.textLight} />
                        <ThemedText style={styles.noImageText}>{i18n.t('receipts.detail.actions.no_file')}</ThemedText>
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



                    {/* Type-specific fields */}
                    {renderTypeSpecificFields()}
                </View>

                {/* Description Card - Hidden as requested */}
                {/* 
                {attachment.description && (
                    <View style={styles.card}>
                        ...
                    </View>
                )} 
                */}

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

                    {/* Edit Button - Hide or Disable based on permissions */}
                    {/* We can also just let it navigate and the EditScreen will block it, 
                        but better UX is to alert or hide here. 
                        Let's allow navigation but alert if permission is View-only? 
                        Or just hide if view only? 
                        User might want to see details. 
                        Actually, let's just navigate. The EditScreen handles the check now. */}
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
        </SafeAreaView>
    );
}
