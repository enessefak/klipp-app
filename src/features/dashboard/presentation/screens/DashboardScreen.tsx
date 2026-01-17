import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { DashboardRepository } from '@/src/features/dashboard/data/DashboardRepository';
import { DashboardData } from '@/src/features/dashboard/domain/Dashboard';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardStats } from '../components/DashboardStats';
import { FolderSummaryList } from '../components/FolderSummaryList';
import { RecentActivity } from '../components/RecentActivity';

export function DashboardScreen() {
    const { colors } = useSettings();
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const result = await DashboardRepository.getDashboardStats();
            setData(result);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading && !data) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                <View style={styles.header}>
                    <View>
                        <ThemedText style={{ color: colors.textLight, fontSize: 14 }}>
                            {i18n.t('receipts.home.welcome')}
                        </ThemedText>
                        <ThemedText type="title" style={{ color: colors.primary, marginTop: 4 }}>
                            {user?.name || i18n.t('profile.name')}
                        </ThemedText>
                    </View>
                </View>

                {data && (
                    <>
                        <DashboardStats data={data.overview} />
                        <FolderSummaryList folders={data.folders} />
                        <RecentActivity activities={data.recentActivity} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
    }
});
