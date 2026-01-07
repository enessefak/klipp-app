import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useMemo, useState } from 'react';
import { ActionSheetIOS, Modal, Platform, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Folder } from '../../domain/Folder';

interface FolderCardProps {
    folder: Folder;
    onPress: (folder: Folder) => void;
    onShare?: (folder: Folder) => void;
    onExport?: (folder: Folder) => void;
    onEdit?: (folder: Folder) => void;
    onDelete?: (folder: Folder) => void;
    size?: 'small' | 'medium' | 'large';
    showSharedBadge?: boolean;
    showMoreButton?: boolean;
}

// Default folder color when not specified
const DEFAULT_FOLDER_COLOR = '#3B82F6'; // Blue like in web

/**
 * Check if a string is an emoji
 */
const isEmoji = (str: string): boolean => {
    if (!str) return false;
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]|^[\u{1F600}-\u{1F64F}]|^[\u{1F680}-\u{1F6FF}]/u;
    return emojiRegex.test(str);
};

/**
 * FolderCard - Grid-style folder card component matching web design
 * Displays folder icon centered with name below
 */
export function FolderCard({
    folder,
    onPress,
    onShare,
    onExport,
    onEdit,
    onDelete,
    size = 'medium',
    showSharedBadge = false,
    showMoreButton = true,
}: FolderCardProps) {
    const { colors } = useSettings();
    const [menuVisible, setMenuVisible] = useState(false);

    // Use default color if folder.color is not set
    const folderColor = folder.color || DEFAULT_FOLDER_COLOR;

    const dimensions = useMemo(() => {
        switch (size) {
            case 'small':
                return { card: 100, icon: 32, iconContainer: 48, fontSize: 12 };
            case 'large':
                return { card: 160, icon: 48, iconContainer: 72, fontSize: 16 };
            default:
                return { card: 130, icon: 40, iconContainer: 60, fontSize: 14 };
        }
    }, [size]);

    const styles = useMemo(() => StyleSheet.create({
        card: {
            width: dimensions.card,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        moreButton: {
            position: 'absolute',
            top: 4,
            right: 4,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
        },
        iconContainer: {
            width: dimensions.iconContainer,
            height: dimensions.iconContainer,
            borderRadius: 8, // Rounded square like web
            backgroundColor: folderColor + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            marginTop: 4,
        },
        iconEmoji: {
            fontSize: dimensions.icon - 8,
        },
        name: {
            fontSize: dimensions.fontSize,
            color: colors.text,
            textAlign: 'center',
        },
        sharedBadge: {
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: colors.success + '20',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
        },
        sharedBadgeText: {
            fontSize: 10,
            color: colors.success,
            fontWeight: '600',
        },
        ownerText: {
            fontSize: 11,
            color: colors.textLight,
            marginTop: 4,
            textAlign: 'center',
        },
        // Menu modal styles
        menuOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        menuContainer: {
            backgroundColor: colors.card,
            borderRadius: 12,
            minWidth: 160,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            gap: 12,
        },
        menuItemBorder: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        menuItemText: {
            fontSize: 15,
            color: colors.text,
        },
        menuItemTextDestructive: {
            color: colors.error,
        },
    }), [colors, dimensions, folderColor]);

    const handleMorePress = () => {
        if (Platform.OS === 'ios') {
            const options = [
                i18n.t('common.actions.cancel'),
                i18n.t('folders.actions.share'),
                i18n.t('folders.actions.export'),
                i18n.t('folders.actions.edit'),
                i18n.t('folders.actions.delete'),
            ];

            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: 0,
                    destructiveButtonIndex: 4,
                },
                (buttonIndex) => {
                    switch (buttonIndex) {
                        case 1:
                            onShare?.(folder);
                            break;
                        case 2:
                            onExport?.(folder);
                            break;
                        case 3:
                            onEdit?.(folder);
                            break;
                        case 4:
                            onDelete?.(folder);
                            break;
                    }
                }
            );
        } else {
            setMenuVisible(true);
        }
    };

    const handleMenuAction = (action: () => void) => {
        setMenuVisible(false);
        action();
    };

    // Determine if icon is emoji or SF Symbol
    const iconIsEmoji = isEmoji(folder.icon || '');

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(folder)}
            activeOpacity={0.7}
        >
            {showSharedBadge && folder.isShared && (
                <View style={styles.sharedBadge}>
                    <ThemedText style={styles.sharedBadgeText}>Shared</ThemedText>
                </View>
            )}

            {/* More Button */}
            {showMoreButton && (onShare || onExport || onEdit || onDelete) && (
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={handleMorePress}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <IconSymbol name="ellipsis" size={18} color={colors.gray} />
                </TouchableOpacity>
            )}

            <View style={styles.iconContainer}>
                {iconIsEmoji ? (
                    <ThemedText style={styles.iconEmoji}>{folder.icon}</ThemedText>
                ) : (
                    <IconSymbol
                        name={(folder.icon || 'folder.fill') as any}
                        size={dimensions.icon}
                        color={folderColor}
                    />
                )}
            </View>

            <ThemedText
                type="defaultSemiBold"
                style={styles.name}
                numberOfLines={2}
            >
                {folder.name}
            </ThemedText>

            {folder.isShared && folder.owner && (
                <ThemedText style={styles.ownerText} numberOfLines={1}>
                    {folder.owner.name}
                </ThemedText>
            )}

            {/* Android Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View style={styles.menuOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.menuContainer}>
                                {onShare && (
                                    <TouchableOpacity
                                        style={[styles.menuItem, styles.menuItemBorder]}
                                        onPress={() => handleMenuAction(() => onShare(folder))}
                                    >
                                        <IconSymbol name="square.and.arrow.up" size={18} color={colors.text} />
                                        <ThemedText style={styles.menuItemText}>
                                            {i18n.t('folders.actions.share')}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                                {onExport && (
                                    <TouchableOpacity
                                        style={[styles.menuItem, styles.menuItemBorder]}
                                        onPress={() => handleMenuAction(() => onExport(folder))}
                                    >
                                        <IconSymbol name="arrow.down.doc" size={18} color={colors.text} />
                                        <ThemedText style={styles.menuItemText}>
                                            {i18n.t('folders.actions.export')}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                                {onEdit && (
                                    <TouchableOpacity
                                        style={[styles.menuItem, styles.menuItemBorder]}
                                        onPress={() => handleMenuAction(() => onEdit(folder))}
                                    >
                                        <IconSymbol name="pencil" size={18} color={colors.text} />
                                        <ThemedText style={styles.menuItemText}>
                                            {i18n.t('folders.actions.edit')}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                                {onDelete && !folder.isSystem && (
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => handleMenuAction(() => onDelete(folder))}
                                    >
                                        <IconSymbol name="trash" size={18} color={colors.error} />
                                        <ThemedText style={[styles.menuItemText, styles.menuItemTextDestructive]}>
                                            {i18n.t('folders.actions.delete')}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </TouchableOpacity>
    );
}
