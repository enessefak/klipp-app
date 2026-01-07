import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Folder } from '../../domain/Folder';

interface BreadcrumbItem {
    id: string | null;
    name: string;
    icon?: string;
}

interface BreadcrumbNavigationProps {
    items: BreadcrumbItem[];
    onNavigate: (id: string | null) => void;
}

/**
 * BreadcrumbNavigation - Horizontal breadcrumb navigation bar
 * Shows: 🏠 > Folder 1 > Folder 2 > Current
 */
export function BreadcrumbNavigation({
    items,
    onNavigate,
}: BreadcrumbNavigationProps) {
    const { colors } = useSettings();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [contentWidth, setContentWidth] = useState(0);

    // Auto-scroll to end when items change
    useEffect(() => {
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [items]);

    const showGradient = contentWidth > containerWidth + 8;

    const formatLabel = (name: string) => {
        const MAX = 18;
        return name.length > MAX ? `${name.slice(0, MAX - 1).trim()}…` : name;
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingTop: insets.top,
            height: 48 + insets.top,
        },
        scrollContent: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            height: 48,
        },
        breadcrumbItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
        },
        homeIcon: {
            padding: 4,
        },
        separator: {
            marginHorizontal: 8,
        },
        breadcrumbText: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
        },
        breadcrumbTextActive: {
            color: colors.text,
            fontWeight: '600',
        },
        breadcrumbTextDisabled: {
            color: colors.textLight,
        },
        gradient: {
            position: 'absolute',
            right: 0,
            top: insets.top,
            bottom: 0,
            width: 40,
        },
    }), [colors, insets.top]);

    return (
        <View
            style={styles.container}
            onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        >
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onContentSizeChange={(width) => setContentWidth(width)}
            >
                {/* Home Icon */}
                <TouchableOpacity
                    style={styles.breadcrumbItem}
                    onPress={() => onNavigate(null)}
                >
                    <View style={styles.homeIcon}>
                        <IconSymbol
                            name="house.fill"
                            size={18}
                            color={items.length === 0 ? colors.text : colors.primary}
                        />
                    </View>
                </TouchableOpacity>

                {/* Breadcrumb Items */}
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <View key={item.id || 'root'} style={styles.breadcrumbItem}>
                            <IconSymbol
                                name="chevron.right"
                                size={12}
                                color={colors.gray}
                                style={styles.separator}
                            />
                            <TouchableOpacity
                                onPress={() => !isLast && onNavigate(item.id)}
                                disabled={isLast}
                            >
                                <ThemedText
                                    style={[
                                        styles.breadcrumbText,
                                        isLast && styles.breadcrumbTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {formatLabel(item.name)}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
            {showGradient && (
                <LinearGradient
                    pointerEvents="none"
                    colors={['transparent', colors.headerBackground]}
                    style={styles.gradient}
                />
            )}
        </View>
    );
}

/**
 * Helper function to build breadcrumb path from folder hierarchy
 */
export function buildBreadcrumbPath(
    currentFolder: Folder | null,
    allFolders: Folder[]
): BreadcrumbItem[] {
    if (!currentFolder) return [];

    const path: BreadcrumbItem[] = [];
    let current: Folder | undefined = currentFolder;

    while (current) {
        path.unshift({
            id: current.id,
            name: current.name,
            icon: current.icon,
        });

        if (!current.parentId) break;
        current = allFolders.find(f => f.id === current!.parentId);
    }

    return path;
}
