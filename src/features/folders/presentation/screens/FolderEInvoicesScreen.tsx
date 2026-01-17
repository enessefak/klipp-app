import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EInvoiceTab } from '@/src/features/e-invoices/presentation/components/EInvoiceTab';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function FolderEInvoicesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useSettings();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.headerBackground, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={{ color: colors.text }}>E-Faturalar</ThemedText>
                <View style={{ width: 40 }} />
            </View>
            <EInvoiceTab folderId={id} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        width: 40,
        alignItems: 'center',
    },
});
