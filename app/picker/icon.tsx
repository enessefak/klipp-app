import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const ICONS = ['folder.fill', 'briefcase.fill', 'house.fill', 'star.fill', 'heart.fill', 'tag.fill'];

export default function IconPickerScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const navigation = useNavigation();
    const { onIconSelect } = usePicker();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'İkon Seç',
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                    <ThemedText style={{ color: colors.primary, fontSize: 17 }}>İptal</ThemedText>
                </TouchableOpacity>
            ),
        });
    }, [navigation, colors, router]);

    const handleSelect = (icon: string) => {
        onIconSelect(icon);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.grid}>
                {ICONS.map(icon => (
                    <TouchableOpacity
                        key={icon}
                        onPress={() => handleSelect(icon)}
                        style={[styles.iconOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <IconSymbol name={icon as any} size={32} color={colors.text} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'flex-start',
    },
    iconOption: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});
