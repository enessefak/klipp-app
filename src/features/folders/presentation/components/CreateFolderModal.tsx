
import { Button, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, Modal, ScrollView, StyleSheet, Switch, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { EInvoiceSettingsForm } from '../../../e-invoices/presentation/components/EInvoiceSettingsForm';
import { CreateFolderDTO, Folder } from '../../domain/Folder';
import { getFolderOptions } from '../../domain/FolderOptionsService';

// Fallback options if API fails
const FALLBACK_ICONS = [
    'folder.fill',
    'briefcase.fill',
    'house.fill',
    'star.fill',
    'heart.fill',
    'tag.fill',
    'tray.fill',
    'person.fill',
    'briefcase',
    'heart.text.square.fill',
    'graduationcap.fill',
    'doc.text.fill',
    'person.text.rectangle.fill'
];
const FALLBACK_COLORS = [
    '#4DABF7',
    '#1C2A4E',
    '#FF9500',
    '#FF3B30',
    '#34C759',
    '#AF52DE',
];

interface CreateFolderModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (dto: CreateFolderDTO) => void;
    parentId: string | null;
    initialData?: Folder; // For editing
}

export function CreateFolderModal({ visible, onClose, onSubmit, parentId, initialData }: CreateFolderModalProps) {
    const { colors } = useSettings();
    const [activeTab, setActiveTab] = useState<'settings' | 'efatura'>('settings');

    // Dynamic options from API
    const [icons, setIcons] = useState<string[]>(FALLBACK_ICONS);
    const [colorOptions, setColorOptions] = useState<string[]>(FALLBACK_COLORS);
    const [optionsLoading, setOptionsLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(FALLBACK_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(FALLBACK_COLORS[0]);
    const [requiresApproval, setRequiresApproval] = useState(false);
    const [isConfidential, setIsConfidential] = useState(false);
    const [allowedTransactionTypes, setAllowedTransactionTypes] = useState<string[]>([]);

    // Restriction State
    const [restrictDocTypes, setRestrictDocTypes] = useState(false);
    const [allowedTypeIds, setAllowedTypeIds] = useState<string[]>([]);
    const [attachmentTypes, setAttachmentTypes] = useState<any[]>([]);

    useEffect(() => {
        loadAttachmentTypes();
        loadFolderOptions();
    }, []);

    const loadFolderOptions = async () => {
        setOptionsLoading(true);
        try {
            const options = await getFolderOptions();
            if (options) {
                const iconValues = options.icons.map(i => i.value);
                const colorValues = options.colors.map(c => c.value);
                setIcons(iconValues);
                setColorOptions(colorValues);
                // Only set defaults if not editing
                if (!initialData) {
                    setSelectedIcon(iconValues[0] || FALLBACK_ICONS[0]);
                    setSelectedColor(colorValues[0] || FALLBACK_COLORS[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load folder options:', error);
            // Keep using fallback values
        } finally {
            setOptionsLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setActiveTab('settings');
            if (initialData) {
                setName(initialData.name);
                setSelectedIcon(initialData.icon);
                setSelectedColor(initialData.color);
                setRequiresApproval(initialData.requiresApproval || false);
                setIsConfidential(initialData.isConfidential || false);
                setAllowedTransactionTypes(initialData.allowedTransactionTypes || []);

                const hasRestrictions = (initialData.allowedTypeIds?.length ?? 0) > 0;
                setRestrictDocTypes(hasRestrictions);
                setAllowedTypeIds(initialData.allowedTypeIds || []);
            } else {
                resetForm();
            }
        }
    }, [visible, initialData]);

    const resetForm = () => {
        setName('');
        setSelectedIcon(icons[0] || FALLBACK_ICONS[0]);
        setSelectedColor(colorOptions[0] || FALLBACK_COLORS[0]);
        setRequiresApproval(false);
        setIsConfidential(false);
        setAllowedTransactionTypes([]);
        setRestrictDocTypes(false);
        setAllowedTypeIds([]);
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
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20
        },
        container: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            maxHeight: '90%',
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        tabs: {
            flexDirection: 'row',
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20
        },
        tab: {
            flex: 1,
            paddingVertical: 8,
            alignItems: 'center',
            borderRadius: 8,
        },
        activeTab: {
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        content: {
            gap: 16
        },
        label: {
            fontSize: 14,
            color: colors.textLight,
            marginTop: 8,
            marginBottom: 8
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12
        },
        iconOption: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.background,
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
            width: 44,
            height: 44,
            borderRadius: 22,
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
            gap: 12,
            padding: 12,
            backgroundColor: colors.background,
            borderRadius: 12
        },
        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 4
        },
        actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border
        },
        actionButton: {
            flex: 1
        },
    }), [colors]);

    const handleSubmit = () => {
        if (!name.trim()) return;

        onSubmit({
            name,
            icon: selectedIcon,
            color: selectedColor,
            parentId: parentId,
            requiresApproval,
            isConfidential,
            allowedTransactionTypes,
            allowedTypeIds: restrictDocTypes ? allowedTypeIds : []
        });

        // Reset and close
        resetForm();
        onClose();
    };

    const renderSettings = () => (
        <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <FormField label="Klasör Adı" required>
                    <TextInput
                        placeholder="Klasör adı girin"
                        value={name}
                        onChangeText={setName}
                    />
                </FormField>

                <View>
                    <ThemedText style={styles.label}>İkon Seç</ThemedText>
                    <View style={styles.grid}>
                        {icons.map((icon: string) => (
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
                </View>

                <View>
                    <ThemedText style={styles.label}>Renk Seç</ThemedText>
                    <View style={styles.grid}>
                        {colorOptions.map((color: string) => (
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
                </View>

                {/* Restrictions Section */}
                <View style={styles.section}>
                    <ThemedText style={{ fontWeight: '600', marginBottom: 4 }}>Kısıtlamalar</ThemedText>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <ThemedText style={{ fontSize: 14 }}>Onay Gerektir</ThemedText>
                        <Switch
                            value={requiresApproval}
                            onValueChange={setRequiresApproval}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <ThemedText style={{ fontSize: 14 }}>Gizli Klasör</ThemedText>
                        <Switch
                            value={isConfidential}
                            onValueChange={setIsConfidential}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>

                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

                    <View>
                        <ThemedText style={{ fontSize: 14, marginBottom: 8 }}>İşlem Türleri</ThemedText>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
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
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: 8,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: allowedTransactionTypes.includes(type) ? colors.primary : colors.border,
                                        backgroundColor: allowedTransactionTypes.includes(type) ? colors.primary + '10' : 'transparent'
                                    }}
                                >
                                    <IconSymbol
                                        name={allowedTransactionTypes.includes(type) ? "checkmark.square.fill" : "square"}
                                        size={20}
                                        color={allowedTransactionTypes.includes(type) ? colors.primary : colors.textLight}
                                    />
                                    <ThemedText style={{ fontSize: 13 }}>{type === 'INCOME' ? 'Gelir' : 'Gider'}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>Belge Türlerini Kısıtla</ThemedText>
                            <ThemedText style={{ fontSize: 12, color: colors.textLight }}>Bu klasöre sadece seçili belgeler eklenebilir.</ThemedText>
                        </View>
                        <Switch
                            value={restrictDocTypes}
                            onValueChange={setRestrictDocTypes}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>

                    {restrictDocTypes && (
                        <View style={{ paddingLeft: 8, gap: 8, marginTop: 4 }}>
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
                                    <ThemedText style={{ fontSize: 14 }}>{type.label}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <ThemedText type="subtitle" style={styles.title}>
                                {initialData ? 'Klasörü Düzenle' : 'Yeni Klasör Oluştur'}
                            </ThemedText>
                            <TouchableOpacity onPress={onClose}>
                                <IconSymbol name="xmark" size={20} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        {/* Tabs */}
                        {initialData && (
                            <View style={styles.tabs}>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
                                    onPress={() => setActiveTab('settings')}
                                >
                                    <ThemedText style={{ fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>Ayarlar</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'efatura' && styles.activeTab]}
                                    onPress={() => setActiveTab('efatura')}
                                >
                                    <ThemedText style={{ fontWeight: activeTab === 'efatura' ? 'bold' : 'normal' }}>E-Fatura</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {activeTab === 'settings' ? (
                            <>
                                {renderSettings()}
                                <View style={styles.actions}>
                                    <Button
                                        title="İptal"
                                        variant="outline"
                                        onPress={onClose}
                                        style={styles.actionButton}
                                    />
                                    <Button
                                        title={initialData ? "Kaydet" : "Oluştur"}
                                        onPress={handleSubmit}
                                        style={styles.actionButton}
                                        disabled={!name.trim()}
                                    />
                                </View>
                            </>
                        ) : (
                            <View style={{ minHeight: 400 }}>
                                {initialData ? (
                                    <EInvoiceSettingsForm
                                        folderId={initialData.id}
                                        onSave={() => {
                                            // Maybe show success toast
                                            onClose();
                                        }}
                                    />
                                ) : (
                                    <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
                                        E-Fatura ayarlarını yapmak için önce klasörü oluşturmalısınız.
                                    </ThemedText>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
