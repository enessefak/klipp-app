import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Folder } from '../../domain/Folder';
import { FolderCard } from './FolderCard';

interface FolderGridSectionProps {
    folders: Folder[];
    title?: string;
    onPressFolder: (folder: Folder) => void;
    onAddPress?: () => void;
    onFilterPress?: () => void;
    horizontal?: boolean;
    showAddButton?: boolean;
    showFilterButton?: boolean;
    emptyText?: string;
}

/**
 * FolderGridSection - Grid section for displaying folders
 * Can be horizontal scrollable or vertical grid
 */
export function FolderGridSection({
    folders,
    title = i18n.t('folders.title'),
    onPressFolder,
    onAddPress,
    onFilterPress,
    horizontal = true,
    showAddButton = true,
    showFilterButton = true,
    emptyText,
}: FolderGridSectionProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 24,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginBottom: 12,
        },
        title: {
            fontSize: 18,
            color: colors.text,
        },
        actions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        actionButtonPrimary: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        actionButtonText: {
            fontSize: 13,
            color: colors.text,
            fontWeight: '500',
        },
        actionButtonTextPrimary: {
            color: colors.white,
        },
        horizontalScroll: {
            paddingHorizontal: 16,
        },
        horizontalContent: {
            flexDirection: 'row',
            gap: 12,
        },
        verticalGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            gap: 12,
        },
        emptyContainer: {
            paddingHorizontal: 16,
            paddingVertical: 24,
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 14,
            color: colors.textLight,
            textAlign: 'center',
        },
    }), [colors]);

    if (folders.length === 0 && !showAddButton) {
        return null;
    }

    const renderContent = () => {
        if (folders.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="folder" size={32} color={colors.border} />
                    <ThemedText style={styles.emptyText}>
                        {emptyText || i18n.t('folders.empty')}
                    </ThemedText>
                </View>
            );
        }

        if (horizontal) {
            return (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalContent}
                    style={styles.horizontalScroll}
                >
                    {folders.map((folder) => (
                        <FolderCard
                            key={folder.id}
                            folder={folder}
                            onPress={onPressFolder}
                            size="medium"
                        />
                    ))}
                </ScrollView>
            );
        }

        return (
            <View style={styles.verticalGrid}>
                {folders.map((folder) => (
                    <FolderCard
                        key={folder.id}
                        folder={folder}
                        onPress={onPressFolder}
                        size="medium"
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle" style={styles.title}>
                    {title}
                </ThemedText>

                <View style={styles.actions}>
                    {showAddButton && onAddPress && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonPrimary]}
                            onPress={onAddPress}
                        >
                            <IconSymbol name="plus" size={14} color={colors.white} />
                            <ThemedText style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                                {i18n.t('common.actions.add', { defaultValue: 'Add' })}
                            </ThemedText>
                        </TouchableOpacity>
                    )}

                    {showFilterButton && onFilterPress && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onFilterPress}
                        >
                            <IconSymbol name="line.3.horizontal.decrease" size={14} color={colors.text} />
                            <ThemedText style={styles.actionButtonText}>
                                {i18n.t('filters.title', { defaultValue: 'Filter' })}
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {renderContent()}
        </View>
    );
}
