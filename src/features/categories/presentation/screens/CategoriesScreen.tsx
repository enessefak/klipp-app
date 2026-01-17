import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { CategoryService } from '@/src/infrastructure/api/generated/services/CategoryService';
import i18n from '@/src/infrastructure/localization/i18n';

interface Category {
    id: string;
    name: string;
    accountCode?: string;
}

export function CategoriesScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            padding: 16,
            paddingBottom: 12,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        listContent: {
            padding: 16,
            paddingBottom: 100,
        },
        categoryCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        categoryIcon: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        categoryInfo: {
            flex: 1,
        },
        categoryName: {
            fontSize: 16,
            color: colors.text,
        },
        categoryCode: {
            fontSize: 13,
            color: colors.textLight,
            marginTop: 2,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
        },
        emptyIcon: {
            marginBottom: 16,
        },
        emptyText: {
            fontSize: 16,
            color: colors.textLight,
            textAlign: 'center',
        },
        fab: {
            position: 'absolute',
            bottom: 100,
            right: 24,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 100,
        },
    }), [colors]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            console.log('Fetching categories...');
            const response = await CategoryService.getCategories() as any;
            console.log('Categories response:', JSON.stringify(response, null, 2));

            if (response.data && Array.isArray(response.data.items)) {
                setCategories(response.data.items);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                console.warn('Unexpected categories response format', response);
                setCategories([]);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            Alert.alert(i18n.t('common.error'), i18n.t('receipts.home.error_load'));
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCategories();
        }, [])
    );

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        const query = searchQuery.toLowerCase();
        return categories.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.accountCode?.toLowerCase().includes(query)
        );
    }, [categories, searchQuery]);

    const renderCategory = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.7}
            onPress={() => router.push(`/categories/edit/${item.id}`)}
        >
            <View style={styles.categoryIcon}>
                <IconSymbol name="tag.fill" size={20} color={colors.primary} />
            </View>
            <View style={styles.categoryInfo}>
                <ThemedText type="defaultSemiBold" style={styles.categoryName}>
                    {item.name}
                </ThemedText>
                {item.accountCode && (
                    <ThemedText style={styles.categoryCode}>
                        {i18n.t('categories.fields.account_code')}: {item.accountCode}
                    </ThemedText>
                )}
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.gray} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <ThemedText type="title" style={{ color: colors.primary }}>
                        {i18n.t('categories.title')}
                    </ThemedText>
                </View>

                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={i18n.t('common.search')}
                    onClear={() => setSearchQuery('')}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : filteredCategories.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="tag.fill" size={64} color={colors.border} style={styles.emptyIcon} />
                    <ThemedText style={styles.emptyText}>{i18n.t('categories.empty')}</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredCategories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/categories/create')}
            >
                <IconSymbol name="plus" size={32} color={colors.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
