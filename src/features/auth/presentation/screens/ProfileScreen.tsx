import { ThemedText } from '@/components/themed-text';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { useNotifications } from '@/src/features/notifications/presentation/useNotifications';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { useFolderSharing } from '@/src/features/sharing/presentation/useFolderSharing';
import i18n from '@/src/infrastructure/localization/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingItemProps {
    icon: IconSymbolName;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
    destructive?: boolean;
}

function SettingItem({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
    destructive = false,
}: SettingItemProps) {
    const { colors } = useSettings();
    const finalIconColor = iconColor || colors.text;

    const styles = useMemo(() => StyleSheet.create({
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        settingIcon: {
            width: 36,
            height: 36,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: finalIconColor + '15',
        },
        settingContent: {
            flex: 1,
        },
        settingTitle: {
            fontSize: 16,
            color: colors.text,
        },
        settingSubtitle: {
            fontSize: 13,
            color: colors.textLight,
            marginTop: 2,
        },
        destructiveText: {
            color: colors.error,
        },
    }), [colors, finalIconColor]);

    return (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress && !rightElement}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.settingIcon}>
                <IconSymbol name={icon} size={20} color={finalIconColor} />
            </View>
            <View style={styles.settingContent}>
                <ThemedText style={[styles.settingTitle, destructive && styles.destructiveText]}>
                    {title}
                </ThemedText>
                {subtitle && (
                    <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
                )}
            </View>
            {rightElement}
            {showChevron && onPress && !rightElement && (
                <IconSymbol name="chevron.right" size={16} color={colors.gray} />
            )}
        </TouchableOpacity>
    );
}

function SettingSection({ title, children }: { title?: string; children: React.ReactNode }) {
    const { colors } = useSettings();
    const styles = useMemo(() => StyleSheet.create({
        section: {
            marginTop: 24,
            paddingHorizontal: 16,
        },
        sectionTitle: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textLight,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
            marginLeft: 4,
        },
        sectionContent: {
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
    }), [colors]);

    return (
        <View style={styles.section}>
            {title && <ThemedText style={styles.sectionTitle}>{title}</ThemedText>}
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );
}

export function ProfileScreen() {
    const { logout, user, updateProfile, deleteAccount } = useAuth();
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { unreadCount, refreshUnreadCount } = useNotifications();
    const { pendingCount, refreshPendingCount } = useFolderSharing();
    const { language, setLanguage, theme, setTheme, colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
        },
        content: {
            flex: 1,
        },
        profileCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            marginHorizontal: 16,
            marginTop: 16,
            padding: 16,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        avatar: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.white,
        },
        profileInfo: {
            flex: 1,
            marginLeft: 16,
        },
        profileName: {
            fontSize: 18,
            color: colors.text,
        },
        profileEmail: {
            fontSize: 14,
            color: colors.textLight,
            marginTop: 2,
        },
        editButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
        },
        badge: {
            backgroundColor: colors.error,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            paddingHorizontal: 6,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
        },
        badgeText: {
            color: colors.white,
            fontSize: 12,
            fontWeight: '600',
        },
        versionContainer: {
            alignItems: 'center',
            paddingVertical: 32,
            paddingBottom: 120,
        },
        versionText: {
            fontSize: 13,
            color: colors.gray,
        },
    }), [colors]);

    useEffect(() => {
        refreshUnreadCount();
        refreshPendingCount();
    }, []);

    const handleLanguageChange = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Türkçe', 'English', i18n.t('profile.settings.cancel')],
                    cancelButtonIndex: 2,
                    title: i18n.t('profile.settings.language'),
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) setLanguage('tr');
                    else if (buttonIndex === 1) setLanguage('en');
                }
            );
        } else {
            Alert.alert(
                i18n.t('profile.settings.language'),
                undefined,
                [
                    { text: 'Türkçe', onPress: () => setLanguage('tr') },
                    { text: 'English', onPress: () => setLanguage('en') },
                    { text: i18n.t('profile.settings.cancel'), style: 'cancel' },
                ]
            );
        }
    };

    const handleThemeChange = () => {
        const options = ['system', 'light', 'dark'] as const;
        const labels = [
            i18n.t('profile.settings.themes.system'),
            i18n.t('profile.settings.themes.light'),
            i18n.t('profile.settings.themes.dark')
        ];

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [...labels, i18n.t('profile.settings.cancel')],
                    cancelButtonIndex: 3,
                    title: i18n.t('profile.settings.theme'),
                },
                (buttonIndex) => {
                    if (buttonIndex < 3) setTheme(options[buttonIndex]);
                }
            );
        } else {
            Alert.alert(
                i18n.t('profile.settings.theme'),
                undefined,
                [
                    ...options.map((opt, i) => ({ text: labels[i], onPress: () => setTheme(opt) })),
                    { text: i18n.t('profile.settings.cancel'), style: 'cancel' },
                ]
            );
        }
    };

    const handleLogout = () => {
        Alert.alert(
            i18n.t('profile.settings.logoutConfirmTitle'),
            i18n.t('profile.settings.logoutConfirmMessage'),
            [
                { text: i18n.t('profile.settings.cancel'), style: 'cancel' },
                {
                    text: i18n.t('profile.settings.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleUpdateProfile = () => {
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'Profil Düzenle',
                'Yeni isminizi girin:',
                [
                    {
                        text: 'İptal',
                        style: 'cancel',
                    },
                    {
                        text: 'Kaydet',
                        onPress: (text?: string) => {
                            const name = text;
                            if (name && name.length >= 2) {
                                // Execute async logic without returning promise to Alert
                                (async () => {
                                    try {
                                        await updateProfile(name);
                                        Alert.alert('Başarılı', 'Profil güncellendi');
                                    } catch (error) {
                                        Alert.alert('Hata', 'Profil güncellenemedi');
                                    }
                                })();
                            }
                        },
                    },
                ],
                'plain-text',
                user?.name
            );
        } else {
            // Android fallback - could be a modal, strictly for MVP alerting simplicity
            Alert.alert('Bilgi', 'Bu özellik şu an sadece iOS cihazlarda kullanılabilir.');
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            i18n.t('profile.settings.deleteConfirmTitle'),
            i18n.t('profile.settings.deleteConfirmMessage'),
            [
                { text: i18n.t('profile.settings.cancel'), style: 'cancel' },
                {
                    text: i18n.t('profile.settings.deleteAccount'),
                    style: 'destructive',
                    onPress: () => {
                        // Double confirm
                        Alert.alert(
                            'Kesinlikle Emin Misiniz?',
                            'Bu işlem geri alınamaz.',
                            [
                                { text: 'Vazgeç', style: 'cancel' },
                                {
                                    text: 'Evet, Sil',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            // Try deleting without password first (OAuth users)
                                            await deleteAccount();
                                        } catch (error: any) {
                                            // If password required (400/401), we need to prompt
                                            // Since Alert.prompt is insecure for passwords, and we are lazy:
                                            if (Platform.OS === 'ios') {
                                                Alert.prompt(
                                                    'Şifre Gerekli',
                                                    'Hesabınızı silmek için şifrenizi girin:',
                                                    async (password) => {
                                                        if (password) {
                                                            await deleteAccount(password);
                                                        }
                                                    },
                                                    'secure-text'
                                                );
                                            } else {
                                                Alert.alert('Hata', 'Şifre gereklidir. Lütfen çıkış yapıp tekrar deneyin veya destek ile iletişime geçin.');
                                            }
                                        }
                                    }
                                }
                            ]
                        );
                    },
                },
            ]
        );
    };

    const { from } = useLocalSearchParams<{ from: string }>();

    return (
        <SafeAreaView style={styles.container} edges={['top']} key={language}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                {from === 'home' && (
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
                        <IconSymbol name="chevron.left" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
                <ThemedText type="subtitle" style={[styles.headerTitle, { fontSize: 20 }]}>{i18n.t('profile.title')}</ThemedText>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <ThemedText style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'K'}</ThemedText>
                    </View>
                    <View style={styles.profileInfo}>
                        <ThemedText type="defaultSemiBold" style={styles.profileName}>
                            {user?.name || 'Kullanıcı'}
                        </ThemedText>
                        <ThemedText style={styles.profileEmail}>
                            {user?.email || 'user@example.com'}
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={handleUpdateProfile}>
                        <IconSymbol name="pencil" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Subscription Section */}
                <SettingSection title={i18n.t('subscription.title')}>
                    <SettingItem
                        icon="checkmark.seal.fill"
                        iconColor="#4A90E2"
                        title={i18n.t('subscription.title')}
                        subtitle={i18n.t('subscription.status.free_plan')}
                        onPress={() => router.push('/subscription/paywall')}
                        rightElement={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ThemedText style={{ color: colors.primary, fontSize: 13, marginRight: 4 }}>
                                    {i18n.t('common.actions.upgrade')}
                                </ThemedText>
                                <IconSymbol name="chevron.right" size={14} color={colors.primary} />
                            </View>
                        }
                    />
                </SettingSection>



                {/* Web & Sessions Section */}
                <SettingSection title={i18n.t('profile.settings.web') || 'WEB'}>
                    <SettingItem
                        icon="desktopcomputer"
                        iconColor="#007AFF"
                        title={i18n.t('profile.settings.webLoginUrl') || 'Web Giriş Adresi'}
                        subtitle="https://klipphq.com/login"
                        onPress={async () => {
                            const Clipboard = require('expo-clipboard');
                            await Clipboard.setStringAsync('https://klipphq.com/login');
                            Alert.alert('Bilgi', i18n.t('profile.settings.urlCopied') || 'Adres kopyalandı');
                        }}
                        rightElement={
                            <IconSymbol name="doc.on.doc" size={16} color={colors.primary} />
                        }
                    />
                    <SettingItem
                        icon="qrcode"
                        iconColor="#000000"
                        title={i18n.t('profile.settings.webLogin') || "Web'e Giriş Yap"}
                        subtitle={i18n.t('profile.settings.webLoginSubtitle') || 'Tarayıcıda QR kodu okutun'}
                        onPress={() => router.push('/scan-qr')}
                    />
                    <SettingItem
                        icon="lock.shield"
                        iconColor="#5856D6"
                        title={i18n.t('profile.settings.activeSessions') || 'Oturumlar'}
                        onPress={() => router.push('/web-sessions')}
                    />
                </SettingSection>

                {/* Settings Sections */}
                <SettingSection title={i18n.t('profile.settings.sharing')}>
                    <SettingItem
                        icon="bell.badge.fill"
                        iconColor="#FF3B30"
                        title={i18n.t('profile.settings.notifications')}
                        subtitle={unreadCount > 0 ? i18n.t('profile.settings.notificationsRead', { count: unreadCount }) : i18n.t('profile.settings.notificationsAllRead')}
                        onPress={() => router.push('/notifications')}
                        rightElement={
                            unreadCount > 0 ? (
                                <View style={styles.badge}>
                                    <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
                                </View>
                            ) : undefined
                        }
                    />
                    <SettingItem
                        icon="person.2.fill"
                        iconColor="#34C759"
                        title={i18n.t('profile.settings.sharedWithMe')}
                        subtitle={pendingCount > 0 ? i18n.t('profile.settings.sharedPending', { count: pendingCount }) : i18n.t('profile.settings.sharedSubtitle')}
                        onPress={() => router.push('/shared')}
                        rightElement={
                            pendingCount > 0 ? (
                                <View style={styles.badge}>
                                    <ThemedText style={styles.badgeText}>{pendingCount}</ThemedText>
                                </View>
                            ) : undefined
                        }
                    />
                </SettingSection>

                <SettingSection title={i18n.t('profile.settings.general')}>
                    <SettingItem
                        icon="bell.fill"
                        iconColor="#FF9500"
                        title={i18n.t('profile.settings.notifications')}
                        subtitle={i18n.t('profile.settings.notificationSubtitle')}
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.white}
                            />
                        }
                        showChevron={false}
                    />
                    <SettingItem
                        icon="globe"
                        iconColor="#007AFF"
                        title={i18n.t('profile.settings.language')}
                        subtitle={i18n.t(`profile.settings.languages.${language}`)}
                        onPress={handleLanguageChange}
                    />
                    <SettingItem
                        icon="moon.fill"
                        iconColor="#5856D6"
                        title={i18n.t('profile.settings.theme')}
                        subtitle={i18n.t(`profile.settings.themes.${theme}`)}
                        onPress={handleThemeChange}
                    />
                </SettingSection>

                <SettingSection title={i18n.t('profile.settings.storage')}>
                    <SettingItem
                        icon="icloud"
                        iconColor="#34C759"
                        title={i18n.t('profile.settings.backup')}
                        subtitle={i18n.t('profile.settings.backupSubtitle')}
                        onPress={() => Alert.alert('Bilgi', i18n.t('profile.settings.soon'))}
                    />
                    <SettingItem
                        icon="arrow.down.circle.fill"
                        iconColor="#007AFF"
                        title={i18n.t('profile.settings.export')}
                        onPress={() => Alert.alert('Bilgi', i18n.t('profile.settings.soon'))}
                    />
                </SettingSection>

                <SettingSection title={i18n.t('profile.settings.support')}>
                    <SettingItem
                        icon="envelope.fill"
                        iconColor="#007AFF"
                        title={i18n.t('profile.settings.contact')}
                        onPress={() => Alert.alert('Bilgi', i18n.t('profile.settings.soon'))}
                    />
                    <SettingItem
                        icon="star.fill"
                        iconColor="#FFCC00"
                        title={i18n.t('profile.settings.rate')}
                        onPress={() => Alert.alert('Bilgi', i18n.t('profile.settings.soon'))}
                    />
                </SettingSection>

                <SettingSection title={i18n.t('profile.settings.account')}>
                    <SettingItem
                        icon="rectangle.portrait.and.arrow.right"
                        iconColor={colors.error}
                        title={i18n.t('profile.settings.logout')}
                        onPress={handleLogout}
                        showChevron={false}
                        destructive
                    />
                    <SettingItem
                        icon="trash.fill"
                        iconColor={colors.error}
                        title={i18n.t('profile.settings.deleteAccount')}
                        onPress={handleDeleteAccount}
                        showChevron={false}
                        destructive
                    />
                </SettingSection>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <ThemedText style={styles.versionText}>Klipp v1.0.0</ThemedText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
