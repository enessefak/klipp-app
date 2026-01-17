import { Button, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { EInvoiceSettingsRepository } from '../../data/EInvoiceSettingsRepository';
import { EInvoiceSettings, UpdateEInvoiceSettingsDTO } from '../../domain/EInvoiceSettings';

interface EInvoiceSettingsFormProps {
    folderId?: string;
    onSave?: () => void;
    initialData?: Partial<EInvoiceSettings>;
    onChange?: (settings: Partial<UpdateEInvoiceSettingsDTO>) => void;
}

export function EInvoiceSettingsForm({ folderId, onSave, initialData, onChange }: EInvoiceSettingsFormProps) {
    const { colors } = useSettings();
    const [loading, setLoading] = useState(false);

    // Initialize state
    const [settings, setSettings] = useState<Partial<UpdateEInvoiceSettingsDTO>>(() => ({
        companyName: initialData?.companyName || '',
        taxNumber: initialData?.taxNumber || '',
        taxOffice: initialData?.taxOffice || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        country: initialData?.country || 'Türkiye',
        isActive: initialData?.isActive ?? true,
        provider: initialData?.provider || 'QNB',
        apiCredentials: { username: '', password: '' }, // Start empty
        ...initialData,
        phone: initialData?.phone || undefined,
        email: initialData?.email || undefined,
        webSite: initialData?.webSite || undefined,
        providerName: initialData?.providerName || undefined,
        defaultInvoiceType: initialData?.defaultInvoiceType as any,
    }));

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (onChange) {
            onChange(settings);
        }
    }, [settings]);

    useEffect(() => {
        if (folderId && !initialData) {
            loadSettings();
        }
    }, [folderId]);

    const loadSettings = async () => {
        if (!folderId) return;
        try {
            setLoading(true);
            const data = await EInvoiceSettingsRepository.getSettings(folderId);
            if (data) {
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    phone: data.phone || undefined,
                    email: data.email || undefined,
                    webSite: data.webSite || undefined,
                    providerName: data.providerName || undefined,
                    defaultInvoiceType: data.defaultInvoiceType as any,
                }));
            }
        } catch (err) {
            console.error('Failed to load settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings.companyName || !settings.taxNumber) {
            setError(i18n.t('validation.required'));
            return;
        }

        if (!folderId) return;

        try {
            setLoading(true);
            await EInvoiceSettingsRepository.updateSettings(folderId, settings as UpdateEInvoiceSettingsDTO);
            onSave?.();
        } catch (err: any) {
            setError(err.message || i18n.t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const updateField = (key: keyof UpdateEInvoiceSettingsDTO, value: any) => {
        setSettings(p => ({ ...p, [key]: value }));
    };



    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {error && <ThemedText style={{ color: colors.error, marginBottom: 10 }}>{error}</ThemedText>}

            <FormField label={i18n.t('profile.company.fields.name')} required>
                <TextInput
                    value={settings.companyName}
                    onChangeText={(text) => updateField('companyName', text)}
                    placeholder={i18n.t('profile.company.placeholders.name')}
                />
            </FormField>

            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <FormField label={i18n.t('profile.company.fields.taxNumber')} required>
                        <TextInput
                            value={settings.taxNumber}
                            onChangeText={(text) => updateField('taxNumber', text)}
                            placeholder={i18n.t('profile.company.placeholders.taxNumber')}
                            keyboardType="numeric"
                        />
                    </FormField>
                </View>
                <View style={{ flex: 1 }}>
                    <FormField label={i18n.t('profile.company.fields.taxOffice')}>
                        <TextInput
                            value={settings.taxOffice}
                            onChangeText={(text) => updateField('taxOffice', text)}
                            placeholder={i18n.t('profile.company.placeholders.taxOffice')}
                        />
                    </FormField>
                </View>
            </View>

            <FormField label={i18n.t('profile.company.fields.address')}>
                <TextInput
                    value={settings.address}
                    onChangeText={(text) => updateField('address', text)}
                    placeholder={i18n.t('profile.company.placeholders.address')}
                />
            </FormField>

            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <FormField label={i18n.t('profile.company.fields.city')}>
                        <TextInput
                            value={settings.city}
                            onChangeText={(text) => updateField('city', text)}
                            placeholder={i18n.t('profile.company.placeholders.city')}
                        />
                    </FormField>
                </View>
                <View style={{ flex: 1 }}>
                    <FormField label={i18n.t('profile.company.fields.country')}>
                        <TextInput
                            value={settings.country}
                            onChangeText={(text) => updateField('country', text)}
                            placeholder={i18n.t('profile.company.placeholders.country') || 'Türkiye'}
                        />
                    </FormField>
                </View>
            </View>

            {/* Active Switch Removed as per request */}

            {!onChange && (
                <Button
                    title={i18n.t('common.actions.save')}
                    onPress={handleSave}
                    loading={loading}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        opacity: 0.3,
        marginVertical: 16,
    }
});
