
import { FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import i18n from '@/src/infrastructure/localization/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, Switch, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EInvoiceSettingsRepository } from '../../../e-invoices/data/EInvoiceSettingsRepository';
import { UpdateEInvoiceSettingsDTO } from '../../../e-invoices/domain/EInvoiceSettings';
import { EInvoiceSettingsForm } from '../../../e-invoices/presentation/components/EInvoiceSettingsForm';
import { Folder } from '../../domain/Folder';
import { FolderRepository } from '../../infrastructure/FolderRepository';
import { FolderEvents } from '../FolderEvents';
import { useFolders } from '../useFolders';

// Predefined Options - synced with web folder-icons.ts
const ICONS = [
    'folder.fill',
    'briefcase.fill',
    'house.fill',
    'star.fill',
    'heart.fill',
    'tag.fill',
    'tray.fill',
    // Personnel Template Icons
    'person.fill',
    'briefcase',
    'heart.text.square.fill',
    'graduationcap.fill',
    'doc.text.fill',
    'person.text.rectangle.fill'
];
const COLORS = [
    '#4DABF7', // Cyan
    '#1C2A4E', // Navy
    '#FF9500', // Orange
    '#FF3B30', // Red
    '#34C759', // Green
    '#AF52DE', // Purple
];

export function CreateFolderScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string; parentId?: string; initialTab?: string; name?: string; icon?: string; color?: string }>();
    const isEditing = !!params.id;
    const folderId = params.id;
    const parentId = params.parentId || null;

    // We use useFolders just to get create/update methods, we don't need the list here really
    // But useFolders requires an ID or parentID usually. We can just use it generically.
    const { createFolder, updateFolder } = useFolders(undefined);

    const [activeTab, setActiveTab] = useState<'settings' | 'efatura'>((params.initialTab as 'settings' | 'efatura') || 'settings');
    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<Folder | null>(null);

    // Form State
    const [name, setName] = useState(params.name || '');
    const [selectedIcon, setSelectedIcon] = useState(params.icon || ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(params.color || COLORS[0]);
    const [requiresApproval, setRequiresApproval] = useState(false);
    const [isConfidential, setIsConfidential] = useState(false);
    const [allowedTransactionTypes, setAllowedTransactionTypes] = useState<string[]>([]);

    // Restriction State
    const [restrictDocTypes, setRestrictDocTypes] = useState(false);
    const [allowedTypeIds, setAllowedTypeIds] = useState<string[]>([]);
    const [attachmentTypes, setAttachmentTypes] = useState<any[]>([]);

    useEffect(() => {
        loadAttachmentTypes();
        if (isEditing && folderId) {
            loadFolderDetails();
        }
    }, [isEditing, folderId]);

    const loadFolderDetails = async () => {
        try {
            setIsLoading(true);
            const folder = await FolderRepository.getFolderById(folderId!);
            setInitialData(folder);

            // Populate form
            setName(folder.name);
            setSelectedIcon(folder.icon || ICONS[0]);
            setSelectedColor(folder.color || COLORS[0]);
            setRequiresApproval(folder.requiresApproval || false);
            setIsConfidential(folder.isConfidential || false);
            setAllowedTransactionTypes(folder.allowedTransactionTypes || []);

            const hasRestrictions = (folder.allowedTypeIds?.length ?? 0) > 0;
            setRestrictDocTypes(hasRestrictions);
            setAllowedTypeIds(folder.allowedTypeIds || []);
        } catch (error) {
            console.error('Failed to load folder details:', error);
            // alert error?
        } finally {
            setIsLoading(false);
        }
    };

    const loadAttachmentTypes = async () => {
        try {
            const res = await AttachmentTypeService.getAttachmentTypes();
            if (res.success && res.data) {
                setAttachmentTypes(res.data);
            }
        } catch (e) {
            console.log('Failed to load attachment types', e);
        }
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
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        contentContainer: {
            padding: 16,
            paddingBottom: 40,
        },
        tabs: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
        },
        tab: {
            flex: 1,
            paddingVertical: 8,
            alignItems: 'center',
            borderRadius: 8,
        },
        activeTab: {
            backgroundColor: colors.primary + '15',
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            color: colors.textLight,
            marginBottom: 8,
            fontWeight: '500',
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
        },
        iconOption: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border
        },
        selectedOption: {
            backgroundColor: colors.primary,
            borderColor: colors.primary
        },
        colorOption: {
            width: 48,
            height: 48,
            borderRadius: 24,
        },
        selectedColorOption: {
            borderWidth: 3,
            borderColor: colors.white,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        section: {
            gap: 16,
            padding: 16,
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
        },
        switchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 8,
        },
        transactionTypeButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            flex: 1,
            justifyContent: 'center',
        },
        footer: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
        }
    }), [colors, activeTab]);

    // State
    const [eInvoiceSettings, setEInvoiceSettings] = useState<Partial<UpdateEInvoiceSettingsDTO> | null>(null);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        // Custom Validation for E-Invoice Settings
        if (activeTab === 'efatura' && eInvoiceSettings) {
            const { taxNumber, companyName, country } = eInvoiceSettings;
            if (taxNumber || companyName) {
                if (!taxNumber) {
                    Alert.alert(i18n.t('common.error'), i18n.t('validation.required') + ': ' + i18n.t('profile.company.fields.taxNumber'));
                    return;
                }
                if (!companyName) {
                    Alert.alert(i18n.t('common.error'), i18n.t('validation.required') + ': ' + i18n.t('profile.company.fields.name'));
                    return;
                }

                // Custom validation: If country is Turkey (or empty which defaults to Turkey on backend usually, but here we check explicit input)
                // Actually defaults to Türkiye in form state.
                const isTurkey = !country || country === 'Türkiye' || country === 'Turkey' || country === 'TR';
                if (isTurkey) {
                    const cleanTax = taxNumber.replace(/\D/g, '');
                    if (cleanTax.length !== 10 && cleanTax.length !== 11) {
                        Alert.alert(i18n.t('common.error'), 'Vergi No / TCKN 10 veya 11 haneli olmalıdır.');
                        return;
                    }
                }
            }
        }

        const dto = {
            name,
            icon: selectedIcon,
            color: selectedColor,
            parentId: parentId,
            requiresApproval,
            isConfidential,
            allowedTransactionTypes,
            allowedTypeIds: restrictDocTypes ? allowedTypeIds : []
        };

        try {
            setIsLoading(true);
            let targetFolderId = folderId;

            if (isEditing && folderId) {
                await updateFolder(folderId, dto);
            } else {
                const newFolder = await createFolder(dto);
                targetFolderId = newFolder?.id;
            }

            if (targetFolderId && eInvoiceSettings && (eInvoiceSettings.companyName || eInvoiceSettings.taxNumber)) {
                await EInvoiceSettingsRepository.updateSettings(targetFolderId, eInvoiceSettings as UpdateEInvoiceSettingsDTO);
            }

            // Emit create event to refresh folder lists
            if (!isEditing && targetFolderId) {
                FolderEvents.emitCreate(targetFolderId);
            }

            router.back();
        } catch (error: any) {
            console.error('Failed to save folder:', error);
            const message = error.body?.message || error.message || 'İşlem başarısız oldu.';
            Alert.alert(i18n.t('common.error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    const renderSettings = () => (
        <View>
            <View style={styles.inputContainer}>
                <FormField label={i18n.t('folders.fields.nameLabel')} required>
                    <TextInput
                        placeholder={i18n.t('folders.fields.namePlaceholder')}
                        value={name}
                        onChangeText={setName}
                        style={{ backgroundColor: colors.card }}
                    />
                </FormField>
            </View>

            <ThemedText style={styles.label}>{i18n.t('folders.settings.select_icon')}</ThemedText>
            <View style={styles.grid}>
                {ICONS.map(icon => (
                    <TouchableOpacity
                        key={icon}
                        onPress={() => setSelectedIcon(icon)}
                        style={[
                            styles.iconOption,
                            selectedIcon === icon && styles.selectedOption
                        ]}
                    >
                        <IconSymbol name={icon as any} size={24} color={selectedIcon === icon ? colors.white : colors.text} />
                    </TouchableOpacity>
                ))}
            </View>

            <ThemedText style={styles.label}>{i18n.t('folders.settings.select_color')}</ThemedText>
            <View style={styles.grid}>
                {COLORS.map(color => (
                    <TouchableOpacity
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            selectedColor === color && styles.selectedColorOption
                        ]}
                    />
                ))}
            </View>

            <ThemedText style={styles.label}>{i18n.t('folders.settings.restrictions')}</ThemedText>
            <View style={styles.section}>
                <View style={styles.switchRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <ThemedText style={{ fontSize: 16 }}>{i18n.t('folders.settings.requires_approval')}</ThemedText>
                        <ThemedText style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
                            {i18n.t('folders.settings.requires_approval_desc')}
                        </ThemedText>
                    </View>
                    <Switch
                        value={requiresApproval}
                        onValueChange={setRequiresApproval}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <View style={{ height: 1, backgroundColor: colors.border }} />

                <View style={styles.switchRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <ThemedText style={{ fontSize: 16 }}>{i18n.t('folders.settings.is_confidential')}</ThemedText>
                        <ThemedText style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
                            {i18n.t('folders.settings.is_confidential_desc')}
                        </ThemedText>
                    </View>
                    <Switch
                        value={isConfidential}
                        onValueChange={setIsConfidential}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>
            </View>

            <ThemedText style={styles.label}>{i18n.t('folders.settings.transaction_types')}</ThemedText>
            <View style={[styles.section, { flexDirection: 'row', gap: 12 }]}>
                {['INCOME', 'EXPENSE'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => {
                            if (allowedTransactionTypes.includes(type)) {
                                setAllowedTransactionTypes(prev => prev.filter(t => t !== type));
                            } else {
                                setAllowedTransactionTypes(prev => [...prev, type]);
                            }
                        }}
                        style={[
                            styles.transactionTypeButton,
                            {
                                borderColor: allowedTransactionTypes.includes(type) ? colors.primary : colors.border,
                                backgroundColor: allowedTransactionTypes.includes(type) ? colors.primary + '10' : colors.card
                            }
                        ]}
                    >
                        <IconSymbol
                            name={allowedTransactionTypes.includes(type) ? "checkmark.square.fill" : "square"}
                            size={20}
                            color={allowedTransactionTypes.includes(type) ? colors.primary : colors.textLight}
                        />
                        <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>{type === 'INCOME' ? i18n.t('folder_settings.transaction_types.income') : i18n.t('folder_settings.transaction_types.expense')}</ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <ThemedText style={styles.label}>{i18n.t('folders.settings.doc_types_title')}</ThemedText>
            <View style={styles.section}>
                <View style={styles.switchRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <ThemedText style={{ fontSize: 16 }}>{i18n.t('folders.settings.type_restriction')}</ThemedText>
                        <ThemedText style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>{i18n.t('folders.settings.doc_types_desc')}</ThemedText>
                    </View>
                    <Switch
                        value={restrictDocTypes}
                        onValueChange={setRestrictDocTypes}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                {restrictDocTypes && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                        {attachmentTypes.map(type => (
                            <TouchableOpacity
                                key={type.id}
                                style={styles.checkboxRow}
                                onPress={() => {
                                    if (allowedTypeIds.includes(type.id)) {
                                        setAllowedTypeIds(prev => prev.filter(id => id !== type.id));
                                    } else {
                                        setAllowedTypeIds(prev => [...prev, type.id]);
                                    }
                                }}
                            >
                                <IconSymbol
                                    name={allowedTypeIds.includes(type.id) ? "checkmark.square.fill" : "square"}
                                    size={20}
                                    color={allowedTypeIds.includes(type.id) ? colors.primary : colors.textLight}
                                />
                                <ThemedText style={{ fontSize: 16 }}>{type.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText style={{ color: colors.primary, fontSize: 16 }}>{i18n.t('common.actions.cancel')}</ThemedText>
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.title}>
                    {isEditing ? i18n.t('folders.titles.edit') : i18n.t('folders.titles.create')}
                </ThemedText>
                <TouchableOpacity onPress={handleSubmit} disabled={!name.trim()}>
                    <ThemedText style={{ color: !name.trim() ? colors.textLight : colors.primary, fontSize: 16, fontWeight: '600' }}>
                        {isEditing ? i18n.t('common.actions.save') : i18n.t('common.actions.create')}
                    </ThemedText>
                </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
                            onPress={() => setActiveTab('settings')}
                        >
                            <ThemedText style={{ fontWeight: activeTab === 'settings' ? 'bold' : 'normal', color: activeTab === 'settings' ? colors.primary : colors.text }}>{i18n.t('folder_settings.settings')}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'efatura' && styles.activeTab]}
                            onPress={() => setActiveTab('efatura')}
                        >
                            <ThemedText style={{ fontWeight: activeTab === 'efatura' ? 'bold' : 'normal', color: activeTab === 'efatura' ? colors.primary : colors.text }}>{i18n.t('folders.efatura.tab_title')}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'settings' ? (
                        renderSettings()
                    ) : (
                        <View style={{ minHeight: 400 }}>
                            <EInvoiceSettingsForm
                                folderId={folderId}
                                initialData={eInvoiceSettings || undefined} // we don't fetch full EInvoiceSettings data in this screen separately for edit?
                                // Actually, if we are in Edit mode, we might want to load existing settings for the folderId if eInvoiceSettings is null.
                                // The Form component has a useEffect to loadSettings if folderId is provided.
                                // But if we pass null initialData, it might try to load.
                                // If we don't have folderId (new folder), we rely on onChange.
                                onChange={(state) => setEInvoiceSettings(state)}
                                onSave={() => {
                                    // See notes
                                }}
                            />
                            <ThemedText style={{ marginTop: 16, fontSize: 12, color: colors.textLight, textAlign: 'center' }}>
                                {i18n.t('folders.efatura.save_warning')}
                            </ThemedText>
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
