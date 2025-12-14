import { HomeIcon } from '@/components/ui/home-icon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 80;
const TAB_WIDTH = width;

// Smoother curve path
const getPath = () => {
    const center = TAB_WIDTH / 2;
    // Wider curve for smoother transition
    const curveWidth = 85;
    const curveDepth = 45;

    // Cubic bezier for organic shape
    // L: Line to start of curve
    // C1: Control points for first half of dip
    // C2: Control points for second half of dip
    return `
    M0,0 
    L${center - curveWidth},0 
    C${center - curveWidth * 0.4},0 ${center - curveWidth * 0.3},${curveDepth} ${center},${curveDepth} 
    C${center + curveWidth * 0.3},${curveDepth} ${center + curveWidth * 0.4},0 ${center + curveWidth},0 
    L${TAB_WIDTH},0 
    L${TAB_WIDTH},${TAB_HEIGHT} 
    L0,${TAB_HEIGHT} 
    Z
  `;
};

interface CurvedTabBarProps extends BottomTabBarProps {
    onScanPress?: () => void;
}

export function CurvedTabBar({ state, descriptors, navigation, onScanPress }: CurvedTabBarProps) {
    const { colors } = useSettings();
    // Filter out routes that shouldn't be displayed (like scan which we handle separately)
    const displayRoutes = state.routes.filter(route => route.name !== 'scan');

    const styles = useMemo(() => StyleSheet.create({
        container: {
            position: 'absolute',
            bottom: 0,
            width: TAB_WIDTH,
            height: TAB_HEIGHT,
            backgroundColor: 'transparent',
            // Shadow for the whole bar
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -5 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                android: {
                    elevation: 10,
                },
            }),
        },
        svgContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        svg: {
            // filter: 'drop-shadow(0px -2px 10px rgba(0,0,0,0.05))', // SVG Shadow if supported, else View shadow
        },
        content: {
            flexDirection: 'row',
            height: '100%',
            alignItems: 'flex-start',
        },
        tabItem: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: 60,
            paddingTop: 10,
        },
        middleButtonWrapper: {
            width: 100,
            height: 100,
            justifyContent: 'flex-start',
            alignItems: 'center',
            top: -30, // Slightly improved position
            zIndex: 10,
        },
        circleButton: {
            width: 64, // Slightly resized to fit better in curve without gap issues
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            // Modern shadow for button
            ...Platform.select({
                ios: {
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                },
                android: {
                    elevation: 8,
                },
            }),
        },
        activeDot: {
            width: 4,
            height: 4,
            borderRadius: 2,
            marginTop: 4,
        }
    }), [colors]);

    return (
        <View style={styles.container}>
            {/* SVG Background */}
            <View style={styles.svgContainer}>
                <Svg width={TAB_WIDTH} height={TAB_HEIGHT} style={styles.svg}>
                    <Path
                        d={getPath()}
                        fill={colors.tabBarBackground}
                        stroke={colors.border}
                        strokeWidth={0.5}
                        strokeOpacity={0.2}
                    />
                </Svg>
            </View>

            {/* Tab Items */}
            <View style={styles.content}>
                {/* First tab (Home) */}
                {displayRoutes[0] && (() => {
                    const route = displayRoutes[0];
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);
                    const color = isFocused ? colors.primary : colors.gray;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                            activeOpacity={0.8}
                        >
                            <HomeIcon size={28} color={color} />
                            {isFocused && (
                                <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                            )}
                        </TouchableOpacity>
                    );
                })()}

                {/* Center Scan Button */}
                <View style={styles.middleButtonWrapper} pointerEvents="box-none">
                    <TouchableOpacity
                        style={styles.circleButton}
                        onPress={onScanPress}
                        activeOpacity={0.9}
                    >
                        <IconSymbol name="viewfinder" size={32} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Second tab (Folders) */}
                {displayRoutes[1] && (() => {
                    const route = displayRoutes[1];
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);
                    const color = isFocused ? colors.primary : colors.gray;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                            activeOpacity={0.8}
                        >
                            <IconSymbol name="folder.fill" size={26} color={color} />
                            {isFocused && (
                                <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                            )}
                        </TouchableOpacity>
                    );
                })()}
            </View>
        </View>
    );
}
