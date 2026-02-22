import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAttachmentTypes } from '@/src/features/attachments/presentation/useAttachmentTypes';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function DocumentTypesScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { attachmentTypes, loading, deleteType } = useAttachmentTypes();

    const systemTypes = useMemo(() => attachmentTypes.filter(t => t.isSystem), [attachmentTypes]);
    const customTypes = useMemo(() => attachmentTypes.filter(t => !t.isSystem), [attachmentTypes]);

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 12, color: colors.text },
        content: { flex: 1, padding: 16 },
        sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 },
        sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
        badge: {
            backgroundColor: colors.cardBorder,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            marginLeft: 8,
            flexDirection: 'row',
            alignItems: 'center'
        },
        badgeText: { fontSize: 10, color: colors.textLight, marginLeft: 4, fontWeight: 'bold' },
        card: {
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            overflow: 'hidden'
        },
        typeItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        typeIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
            marginRight: 12,
        },
        typeIcon: { fontSize: 20 },
        typeInfo: { flex: 1 },
        typeName: { fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 4 },
        typeCategory: { fontSize: 13, color: colors.textLight },
        actions: { flexDirection: 'row', gap: 12 },
        actionBtn: { padding: 4 },
        emptyState: { padding: 24, alignItems: 'center', justifyContent: 'center' },
        emptyStateText: { marginTop: 12, color: colors.textLight, textAlign: 'center' },
        fab: {
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        }
    }), [colors]);

    const deleteErrorMessage = (i18n.t('settings.documentTypes.errors.deleteFailed') as string) || 'Silme işlemi başarısız oldu.';
    const readOnlyBadgeLabel = (i18n.t('settings.documentTypes.readOnlyBadge') as string) || 'Sadece Okunur';

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            i18n.t('common.confirm_action') || 'Emin misiniz?',
            (i18n.t('common.confirm_delete', { item: name }) as string) || `${name} silinecek.`,
            [
                { text: i18n.t('common.actions.cancel') || 'İptal', style: 'cancel' },
                {
                    text: i18n.t('common.actions.delete') || 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteType(id);
                        } catch (err) {
                            Alert.alert(i18n.t('common.error') || 'Hata', deleteErrorMessage);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.header, { justifyContent: 'center' }]}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>{i18n.t('settings.documentTypes.title') || 'Belge Türleri'}</ThemedText>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Custom Types */}
                <View style={[styles.sectionTitleContainer, { marginTop: 0 }]}>
                    <ThemedText style={styles.sectionTitle}>{i18n.t('settings.documentTypes.custom') || 'Özel Türlerim'}</ThemedText>
                </View>

                <View style={styles.card}>
                    {customTypes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <IconSymbol name="doc.badge.plus" size={32} color={colors.border} />
                            <ThemedText style={styles.emptyStateText}>
                                {i18n.t('settings.documentTypes.noCustomTypes') || 'Henüz özel bir belge türü oluşturmadınız.'}
                            </ThemedText>
                        </View>
                    ) : (
                        customTypes.map((type, idx) => (
                            <View
                                key={type.id}
                                style={[
                                    styles.typeItem,
                                    idx === customTypes.length - 1 && { borderBottomWidth: 0 }
                                ]}
                            >
                                <View style={styles.typeIconContainer}>
                                    <ThemedText style={styles.typeIcon}>{type.icon || '📄'}</ThemedText>
                                </View>
                                <View style={styles.typeInfo}>
                                    <ThemedText style={styles.typeName}>{type.name}</ThemedText>
                                    <ThemedText style={styles.typeCategory}>{type.category}</ThemedText>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => router.push(`/document-types/edit?id=${type.id}` as any)}
                                    >
                                        <IconSymbol name="pencil" size={20} color={colors.textLight} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleDelete(type.id, type.name)}
                                    >
                                        <IconSymbol name="trash" size={20} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* System Types */}
                <View style={styles.sectionTitleContainer}>
                    <ThemedText style={styles.sectionTitle}>{i18n.t('settings.documentTypes.system') || 'Sistem Türleri'}</ThemedText>
                    <View style={styles.badge}>
                        <IconSymbol name="lock.fill" size={10} color={colors.textLight} />
                        <ThemedText style={styles.badgeText}>{readOnlyBadgeLabel}</ThemedText>
                    </View>
                </View>

                <View style={[styles.card, { opacity: 0.8 }]}>
                    {systemTypes.map((type, idx) => (
                        <View
                            key={type.id}
                            style={[
                                styles.typeItem,
                                idx === systemTypes.length - 1 && { borderBottomWidth: 0 }
                            ]}
                        >
                            <View style={styles.typeIconContainer}>
                                <ThemedText style={styles.typeIcon}>{type.icon || '📄'}</ThemedText>
                            </View>
                            <View style={styles.typeInfo}>
                                <ThemedText style={styles.typeName}>{type.label || type.name}</ThemedText>
                                <ThemedText style={styles.typeCategory}>{type.category}</ThemedText>
                            </View>
                            <View style={[styles.actions, { opacity: 0.5 }]}>
                                <IconSymbol name="lock.fill" size={16} color={colors.textLight} />
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/document-types/create' as any)}
                activeOpacity={0.8}
            >
                <IconSymbol name="plus" size={24} color={colors.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
