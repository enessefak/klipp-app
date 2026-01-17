
import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { EInvoiceRepository } from '../../data/EInvoiceRepository';
import { EInvoice, EInvoiceStatus } from '../../domain/EInvoice';

interface EInvoiceTabProps {
    folderId: string;
}

export function EInvoiceTab({ folderId }: EInvoiceTabProps) {
    const { colors } = useSettings();
    const [invoices, setInvoices] = useState<EInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const loadInvoices = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const { data } = await EInvoiceRepository.getInvoices(folderId);
            setInvoices(data);
        } catch (error) {
            console.error('Load invoices error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, [folderId]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadInvoices(false);
    };

    const handleUpdateStatus = async (invoiceId: string) => {
        try {
            setUpdatingStatus(invoiceId);
            await EInvoiceRepository.getStatus(invoiceId);
            await loadInvoices(false);
            Alert.alert('Başarılı', 'Fatura durumu güncellendi.');
        } catch (error) {
            Alert.alert('Hata', 'Durum güncellenemedi.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleDownloadXml = async (invoiceId: string) => {
        try {
            // In a real app, we'd use FileDownloadService. 
            // For now, let's just alert.
            Alert.alert('Bilgi', 'UBL XML indirme başlatılıyor...');
            await EInvoiceRepository.downloadXml(invoiceId);
        } catch (error) {
            Alert.alert('Hata', 'Dosya indirilemedi.');
        }
    };

    const getStatusColor = (status: EInvoiceStatus) => {
        switch (status) {
            case EInvoiceStatus.ACCEPTED: return colors.success;
            case EInvoiceStatus.ERROR: return colors.error;
            case EInvoiceStatus.REJECTED: return colors.error;
            case EInvoiceStatus.PENDING:
            case EInvoiceStatus.SENT: return colors.primary;
            default: return colors.textLight;
        }
    };

    const renderHeader = () => (
        <View style={styles.tableHeader}>
            <ThemedText style={[styles.columnHeader, { flex: 1.5 }]}>Fatura No</ThemedText>
            <ThemedText style={[styles.columnHeader, { flex: 2 }]}>Alıcı</ThemedText>
            <ThemedText style={[styles.columnHeader, { flex: 1.5 }]}>Tarih</ThemedText>
            <ThemedText style={[styles.columnHeader, { flex: 1 }]}>Durum</ThemedText>
            <ThemedText style={[styles.columnHeader, { width: 40, textAlign: 'center' }]}>İşlem</ThemedText>
        </View>
    );

    const renderItem = ({ item }: { item: EInvoice }) => (
        <View style={styles.tableRow}>
            <ThemedText style={[styles.cell, { flex: 1.5 }]} numberOfLines={1}>{item.invoiceNumber || item.uuid?.slice(0, 8)}</ThemedText>
            <ThemedText style={[styles.cell, { flex: 2 }]} numberOfLines={2}>{item.recipientName || '-'}</ThemedText>
            <ThemedText style={[styles.cell, { flex: 1.5 }]}>
                {item.sentAt ? new Date(item.sentAt).toLocaleDateString('tr-TR') : '-'}
            </ThemedText>
            <View style={{ flex: 1 }}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </ThemedText>
                </View>
            </View>
            <TouchableOpacity style={styles.actionCell} onPress={() => handleDownloadXml(item.id)}>
                <IconSymbol name="square.and.arrow.down" size={18} color={colors.textLight} />
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topActions}>
                <Button
                    title="Durumu Güncelle"
                    variant="outline"
                    onPress={() => loadInvoices(true)}
                    loading={loading}
                    size="small"
                    style={{ minWidth: 140 }}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: 600 }}>
                    {renderHeader()}
                    <FlatList
                        data={invoices}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <ThemedText style={{ color: colors.textLight }}>Bu klasörde kayıtlı e-fatura bulunamadı.</ThemedText>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 12
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fafafa'
    },
    columnHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center'
    },
    cell: {
        fontSize: 13,
        color: '#333'
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start'
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600'
    },
    actionCell: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    empty: {
        padding: 40,
        alignItems: 'center'
    }
});
