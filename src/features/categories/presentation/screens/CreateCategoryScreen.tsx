
import { FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { CategoryService } from '@/src/infrastructure/api/generated/services/CategoryService';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CreateCategoryScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const [name, setName] = useState('');
    const [accountCode, setAccountCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;

        try {
            setLoading(true);
            await CategoryService.postCategories({
                name: name.trim(),
                accountCode: accountCode.trim() || undefined,
            });
            Alert.alert(i18n.t('common.success'), i18n.t('categories.messages.create_success'));
            router.back();
        } catch (error) {
            console.error('Failed to create category', error);
            Alert.alert(i18n.t('common.error'), i18n.t('categories.messages.create_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <ThemedText style={{ color: colors.primary, fontSize: 16 }}>{i18n.t('common.actions.cancel')}</ThemedText>
                </TouchableOpacity>

                <ThemedText type="defaultSemiBold" style={{ fontSize: 17 }}>
                    {i18n.t('categories.create_title')}
                </ThemedText>

                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={!name.trim() || loading}
                    style={styles.headerButton}
                >
                    <ThemedText style={{ color: !name.trim() ? colors.gray : colors.primary, fontSize: 16, fontWeight: '600' }}>
                        {i18n.t('common.actions.create')}
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
    }
});
