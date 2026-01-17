import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { useGroups } from '../hooks/useGroups';

export default function GroupsScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { groups, loading, refreshing, refresh, createGroup } = useGroups();
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const handleCreateGroup = async (name: string) => {
        await createGroup(name);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            padding: 16,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            marginBottom: 4,
        },
        headerSubtitle: {
            color: colors.textLight,
            fontSize: 14,
        },
        listContent: {
            padding: 16,
            paddingBottom: 100,
        },
        groupCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        groupIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        groupInfo: {
            flex: 1,
        },
        groupName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        groupMeta: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        memberPreviews: {
            flexDirection: 'row',
            marginRight: 8,
        },
        memberAvatar: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: -8,
            borderWidth: 1,
            borderColor: colors.card,
        },
        memberInitial: {
            fontSize: 10,
            color: colors.textLight,
            fontWeight: 'bold',
        },
        memberCount: {
            fontSize: 13,
            color: colors.textLight,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textLight,
            textAlign: 'center',
        },
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
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.headerTitle}>
                    {i18n.t('groups.title') || 'Gruplarım'}
                </ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                    {i18n.t('groups.subtitle') || 'Gruplarınızı yönetin ve üyeler ekleyin'}
                </ThemedText>
            </View>

            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="person.3.fill" size={64} color={colors.border} />
                            <ThemedText style={styles.emptyText}>
                                {i18n.t('groups.empty') || 'Henüz bir grup oluşturmadınız.'}
                            </ThemedText>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.groupCard}
                        onPress={() => router.push(`/groups/${item.id}`)}
                    >
                        <View style={styles.groupIcon}>
                            {/* Fallback icon if no specific group icon */}
                            <IconSymbol name="person.2.fill" size={24} color={colors.textLight} />
                        </View>
                        <View style={styles.groupInfo}>
                            <ThemedText style={styles.groupName}>{item.name}</ThemedText>
                            <View style={styles.groupMeta}>
                                {/* Member avatars visualization (mock logic for now as we don't have member details in list always) */}
                                <View style={styles.memberPreviews}>
                                    {[...Array(Math.min(3, item.memberCount || 0))].map((_, i) => (
                                        <View key={i} style={styles.memberAvatar}>
                                            <ThemedText style={styles.memberInitial}>?</ThemedText>
                                        </View>
                                    ))}
                                    {(item.memberCount || 0) > 3 && (
                                        <View style={styles.memberAvatar}>
                                            <ThemedText style={styles.memberInitial}>+</ThemedText>
                                        </View>
                                    )}
                                </View>

                                <ThemedText style={styles.memberCount}>
                                    {item.memberCount} {i18n.t('groups.members') || 'üye'}
                                </ThemedText>
                            </View>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={colors.gray} />
                    </TouchableOpacity>
                )}
            />

            {loading && groups.length === 0 && (
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsCreateModalVisible(true)}
            >
                <IconSymbol name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Create Group Modal */}
            <CreateGroupModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSubmit={handleCreateGroup}
            />
        </SafeAreaView>
    );
}
