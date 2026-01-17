
import { Button, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Attachment } from '@/src/features/attachments/domain/Attachment';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Keyboard, Modal, ScrollView, StyleSheet, Switch, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { EInvoiceRepository } from '../../data/EInvoiceRepository';
import { SendEInvoiceDTO } from '../../domain/EInvoice';

interface SendEInvoiceModalProps {
    visible: boolean;
    onClose: () => void;
    attachment: Attachment;
    onSuccess?: () => void;
}

export function SendEInvoiceModal({ visible, onClose, attachment, onSuccess }: SendEInvoiceModalProps) {
    const { colors } = useSettings();
    const [loading, setLoading] = useState(false);

    // Form State
    const [recipientVkn, setRecipientVkn] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPk, setRecipientPk] = useState('');
    const [recipientTaxOffice, setRecipientTaxOffice] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [recipientCity, setRecipientCity] = useState('');

    // Invoice Options
    const [isEArchive, setIsEArchive] = useState(false);
    const [invoiceType, setInvoiceType] = useState<'SATIS' | 'IADE'>('SATIS');
    const [profileId, setProfileId] = useState<'TEMELFATURA' | 'TICARIFATURA'>('TEMELFATURA');
    const [invoiceNumber, setInvoiceNumber] = useState(''); // Optional manual override
    const [note, setNote] = useState('');

    useEffect(() => {
        if (visible && attachment) {
            // Auto-fill from attachment details if possible
            const details = attachment.details as any || {};
            if (details.recipientVkn) setRecipientVkn(details.recipientVkn);
            if (details.recipientName) setRecipientName(details.recipientName);

            // Simple logic: if VKN is 10 digits -> E-Fatura (default), if 11 (TCKN) -> E-Arşiv
            if (details.recipientVkn && details.recipientVkn.length === 11) {
                setIsEArchive(true);
            } else {
                setIsEArchive(false);
            }
        }
    }, [visible, attachment]);

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
            marginBottom: 20
        },
        summaryCard: {
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border
        },
        summaryItem: {
            alignItems: 'center',
            flex: 1,
        },
        summaryLabel: {
            fontSize: 12,
            color: colors.textLight,
            marginBottom: 4
        },
        summaryValue: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text
        },
        section: {
            marginBottom: 20,
            gap: 12
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8
        },
        row: {
            flexDirection: 'row',
            gap: 12
        },
        switchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16
        },
        actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 24,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border
        },
        actionButton: {
            flex: 1
        }
    }), [colors]);

    const handleSend = async () => {
        if (!recipientVkn || !recipientName) {
            Alert.alert('Eksik Bilgi', 'Lütfen alıcı VKN/TCKN ve Adı alanlarını doldurun.');
            return;
        }

        try {
            setLoading(true);
            const dto: SendEInvoiceDTO = {
                recipientVkn,
                recipientName,
                recipientPk: isEArchive ? undefined : recipientPk, // Only needed for E-Fatura
                recipientTaxOffice,
                recipientAddress,
                recipientCity,
                invoiceNumber: invoiceNumber || undefined,
                invoiceType,
                profileId,
                isEArchive,
                notes: note ? [note] : undefined
            };

            const result = await EInvoiceRepository.sendInvoice(attachment.id, dto);
            if (result.success) {
                Alert.alert('Başarılı', 'E-Fatura gönderim kuyruğuna alındı.');
                onSuccess?.();
                onClose();
            } else {
                Alert.alert('Hata', 'Gönderim başarısız oldu.');
            }
        } catch (error: any) {
            console.error('Send invoice error:', error);
            Alert.alert('Hata', error.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const details = attachment.details as any || {};
    // Calculate totals if we have line items, otherwise use totalAmount from header
    const totalAmount = details.totalAmount || 0;
    const taxAmount = details.totalTaxAmount || 0;
    const lineCount = details.lineItems?.length || 0;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <ThemedText type="subtitle" style={{ fontSize: 20 }}>E-Fatura Gönder</ThemedText>
                            <TouchableOpacity onPress={onClose}>
                                <IconSymbol name="xmark" size={24} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryItem}>
                                <ThemedText style={styles.summaryLabel}>Toplam Tutar</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount)}
                                </ThemedText>
                            </View>
                            <View style={[styles.summaryItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
                                <ThemedText style={styles.summaryLabel}>KDV Tutarı</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(taxAmount)}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryItem}>
                                <ThemedText style={styles.summaryLabel}>Kalem Sayısı</ThemedText>
                                <ThemedText style={styles.summaryValue}>{lineCount}</ThemedText>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.switchRow}>
                                <View>
                                    <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>{isEArchive ? 'E-Arşiv' : 'E-Fatura'}</ThemedText>
                                    <ThemedText style={{ fontSize: 12, color: colors.textLight }}>
                                        {isEArchive ? 'E-Arşiv (B2C) olarak gönderilecek' : 'E-Fatura (B2B) olarak gönderilecek'}
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={isEArchive}
                                    onValueChange={setIsEArchive}
                                    trackColor={{ false: colors.primary, true: colors.accent }}
                                />
                            </View>

                            <View style={styles.section}>
                                <ThemedText style={styles.sectionTitle}>Alıcı Bilgileri</ThemedText>
                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <FormField label="Alıcı VKN/TCKN" required>
                                            <TextInput
                                                value={recipientVkn}
                                                onChangeText={setRecipientVkn}
                                                placeholder="11111111111"
                                                keyboardType="numeric"
                                                maxLength={11}
                                            />
                                        </FormField>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormField label="Alıcı Adı" required>
                                            <TextInput
                                                value={recipientName}
                                                onChangeText={setRecipientName}
                                                placeholder="Firma Adı"
                                            />
                                        </FormField>
                                    </View>
                                </View>

                                {!isEArchive && (
                                    <FormField label="Alıcı PK Etiketi">
                                        <TextInput
                                            value={recipientPk}
                                            onChangeText={setRecipientPk}
                                            placeholder="urn:mail:defaultpk"
                                        />
                                    </FormField>
                                )}

                                <FormField label="Alıcı Vergi Dairesi">
                                    <TextInput
                                        value={recipientTaxOffice}
                                        onChangeText={setRecipientTaxOffice}
                                    />
                                </FormField>
                                <FormField label="Alıcı Adres">
                                    <TextInput
                                        value={recipientAddress}
                                        onChangeText={setRecipientAddress}
                                        multiline
                                    />
                                </FormField>
                                <FormField label="Alıcı Şehir">
                                    <TextInput
                                        value={recipientCity}
                                        onChangeText={setRecipientCity}
                                    />
                                </FormField>
                            </View>

                            <View style={styles.section}>
                                <ThemedText style={styles.sectionTitle}>Fatura Seçenekleri</ThemedText>
                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        {/* Simplified Select for Type */}
                                        <FormField label="Fatura Tipi">
                                            <TouchableOpacity
                                                style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}
                                                onPress={() => setInvoiceType(invoiceType === 'SATIS' ? 'IADE' : 'SATIS')}
                                            >
                                                <ThemedText>{invoiceType}</ThemedText>
                                            </TouchableOpacity>
                                        </FormField>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FormField label="Profil">
                                            <TouchableOpacity
                                                style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}
                                                onPress={() => setProfileId(profileId === 'TEMELFATURA' ? 'TICARIFATURA' : 'TEMELFATURA')}
                                            >
                                                <ThemedText>{profileId}</ThemedText>
                                            </TouchableOpacity>
                                        </FormField>
                                    </View>
                                </View>

                                <FormField label="Fatura Numarası (Opsiyonel)">
                                    <TextInput
                                        value={invoiceNumber}
                                        onChangeText={setInvoiceNumber}
                                        placeholder="Otomatik"
                                    />
                                </FormField>

                                <FormField label="Notlar">
                                    <TextInput
                                        value={note}
                                        onChangeText={setNote}
                                        placeholder="Fatura notu..."
                                        multiline
                                        style={{ height: 80 }}
                                    />
                                </FormField>
                            </View>
                        </ScrollView>

                        <View style={styles.actions}>
                            <Button
                                title="İptal"
                                variant="outline"
                                onPress={onClose}
                                style={styles.actionButton}
                                disabled={loading}
                            />
                            <Button
                                title={loading ? "Gönderiliyor..." : "Gönder"}
                                onPress={handleSend}
                                style={styles.actionButton}
                                disabled={loading}
                            />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
