
import { FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { CategoryService } from '@/src/infrastructure/api/generated/services/CategoryService';
import i18n from '@/src/infrastructure/localization/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function EditCategoryScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [name, setName] = useState('');
    const [accountCode, setAccountCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadCategory();
        }
    }, [id]);

    const loadCategory = async () => {
        try {
            setInitialLoading(true);
            const response = await CategoryService.getCategories1(id!) as any;
            if (response.data) {
                setName(response.data.name);
                setAccountCode(response.data.accountCode || '');
            }
        } catch (error) {
            console.error('Failed to load category', error);
            Alert.alert(i18n.t('common.error'), i18n.t('categories.messages.load_error'));
            router.back();
        } finally {
            setInitialLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!name.trim()) return;

        try {
            setLoading(true);
            await CategoryService.putCategories(id!, {
                name: name.trim(),
                accountCode: accountCode.trim() || undefined,
            });
            Alert.alert(i18n.t('common.success'), i18n.t('categories.messages.update_success'));
            router.back();
        } catch (error) {
            console.error('Failed to update category', error);
            Alert.alert(i18n.t('common.error'), i18n.t('categories.messages.update_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            i18n.t('categories.messages.delete_confirm_title'),
            i18n.t('categories.messages.delete_confirm_message'),
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await CategoryService.deleteCategories(id!);
                            Alert.alert(i18n.t('common.success'), i18n.t('categories.messages.delete_success'));
                            router.back();
                        } catch (error) {
                            console.error('Failed to delete category', error);
                            Alert.alert(i18n.t('common.error'), i18n.t('categories.messages.delete_error'));
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ThemedText>Yükleniyor...</ThemedText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <ThemedText style={{ color: colors.primary, fontSize: 16 }}>{i18n.t('common.actions.cancel')}</ThemedText>
                </TouchableOpacity>

                <ThemedText type="defaultSemiBold" style={{ fontSize: 17 }}>
                    {i18n.t('categories.edit_title')}
                </ThemedText>

                <TouchableOpacity
                    onPress={handleUpdate}
                    disabled={!name.trim() || loading}
                    style={styles.headerButton}
                >
                    <ThemedText style={{ color: !name.trim() ? colors.gray : colors.primary, fontSize: 16, fontWeight: '600' }}>
                        {i18n.t('common.actions.save')}
                    </ThemedText>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <FormField label={i18n.t('categories.fields.name')} required>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder={i18n.t('categories.placeholders.name')}
                        autoFocus
                    />
                </FormField>

                <FormField label={i18n.t('categories.fields.account_code')}>
                    <TextInput
                        value={accountCode}
                        onChangeText={setAccountCode}
                        placeholder={i18n.t('categories.placeholders.account_code')}
                        keyboardType="numeric"
                    />
                </FormField>

                <TouchableOpacity
                    style={[styles.deleteButton, { borderColor: colors.error }]}
                    onPress={handleDelete}
                    disabled={loading}
                >
                    <ThemedText style={{ color: colors.error, fontWeight: '600' }}>
                        {i18n.t('common.actions.delete')}
                    </ThemedText>
                </TouchableOpacity>
            </View>
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
    headerButton: {
        minWidth: 60,
        alignItems: 'center',
    },
    content: {
        padding: 20,
        gap: 20,
    },
    deleteButton: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#FF3B3015', // Light red background
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
