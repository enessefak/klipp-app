import { Button, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import type { UpdateUserProfileInput } from '@/src/features/auth/domain/User';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { useNotifications } from '@/src/features/notifications/presentation/useNotifications';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { useFolderSharing } from '@/src/features/sharing/presentation/useFolderSharing';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRevenueCat } from '@/src/infrastructure/revenuecat/RevenueCatProvider';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActionSheetIOS, Alert, Linking, Modal, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
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

type ProfileFormState = {
    name: string;
    taxNumber: string;
    taxOffice: string;
    address: string;
    city: string;
    subdivision: string;
    phone: string;
    email: string;
};

type CompanyFieldKey = Exclude<keyof ProfileFormState, 'name' | 'email'>;

export function ProfileScreen() {
    const { logout, user, updateProfile, deleteAccount } = useAuth();
    const { isPro } = useRevenueCat();
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { unreadCount, refreshUnreadCount } = useNotifications();
    const { pendingCount, refreshPendingCount } = useFolderSharing();
    const { language, setLanguage, theme, setTheme, colors } = useSettings();

    const buildProfileFormState = (targetUser: typeof user): ProfileFormState => ({
        name: targetUser?.name ?? '',
        taxNumber: targetUser?.taxNumber ?? '',
        taxOffice: targetUser?.taxOffice ?? '',
        address: targetUser?.address ?? '',
        city: targetUser?.city ?? '',
        subdivision: targetUser?.subdivision ?? '',
        phone: targetUser?.phone ?? '',
        email: targetUser?.email ?? '',
    });

    const [profileForm, setProfileForm] = useState<ProfileFormState>(() => buildProfileFormState(user));
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);

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
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
        },
        badgeText: {
            color: colors.white,
            fontSize: 12,
            fontWeight: 'bold',
        },
        versionContainer: {
            padding: 24,
            alignItems: 'center',
        },
        versionText: {
            color: colors.textLight,
            fontSize: 13,
        },
        companyIntroCard: {
            padding: 16,
            alignItems: 'center',
        },
        companyIntroText: {
            textAlign: 'center',
            marginBottom: 16,
            color: colors.textLight,
        },
        companyCtaButton: {
            width: '100%',
        },
        companyForm: {
            gap: 16,
        },
        sectionHelper: {
            fontSize: 14,
            color: colors.textLight,
            marginBottom: 8,
        },
        inputWrapper: {
            gap: 8,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
        },
        multilineInput: {
            height: 80,
            textAlignVertical: 'top',
            paddingTop: 12,
        },
        profileSaveButton: {
            marginTop: 16,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
        },
        modalCloseButton: {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            backgroundColor: colors.card,
        },
        modalScrollContent: {
            padding: 20,
        },
    }), [colors]);

    useEffect(() => {
        refreshUnreadCount();
        refreshPendingCount();
    }, []);

    useEffect(() => {
        setProfileForm(buildProfileFormState(user));
    }, [user]);

    const companyKeys: CompanyFieldKey[] = ['taxNumber', 'taxOffice', 'city', 'subdivision', 'address', 'phone'];

    const handleEditProfile = () => {
        setProfileForm(buildProfileFormState(user));
        setIsEditProfileModalVisible(true);
    };

    const handleCloseEditProfileModal = () => {
        setIsEditProfileModalVisible(false);
    };

    const handleProfileFieldChange = (field: keyof ProfileFormState, value: string) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const payload: UpdateUserProfileInput = {};
            const trimmedName = profileForm.name.trim();
            if (trimmedName.length >= 2) {
                payload.name = trimmedName;
            }

            const ensureField = (field: CompanyFieldKey) => {
                const trimmedValue = profileForm[field].trim();
                // If user entered something, include it.
                // If user cleared it (and it was previously set), send empty string to clear it.
                if (trimmedValue.length > 0) {
                    payload[field] = trimmedValue;
                } else if (user?.[field]) {
                    payload[field] = '';
                }
            };

            companyKeys.forEach(ensureField);

            await updateProfile(payload);
            setIsEditProfileModalVisible(false);
            Alert.alert(i18n.t('common.success'), 'Profil bilgileriniz güncellendi.');
        } catch (error) {
            console.error('Save profile error:', error);
            Alert.alert(i18n.t('common.error'), 'Profil bilgileri güncellenemedi.');
        } finally {
            setIsSavingProfile(false);
        }
    };

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

    const handleContactPress = async () => {
        const email = 'info@klipphq.com';
        const subject = encodeURIComponent(`${i18n.t('common.appName')} Support`);
        const mailtoUrl = `mailto:${email}?subject=${subject}`;

        try {
            const canOpen = await Linking.canOpenURL(mailtoUrl);
            if (!canOpen) {
                Alert.alert(i18n.t('common.error'), i18n.t('profile.settings.contactError'));
                return;
            }
            await Linking.openURL(mailtoUrl);
        } catch (error) {
            console.error('Contact email open failed:', error);
            Alert.alert(i18n.t('common.error'), i18n.t('profile.settings.contactError'));
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
        handleEditProfile();
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
                        title={isPro ? "Klipp Pro" : i18n.t('subscription.title')}
                        subtitle={isPro ? "Active" : i18n.t('subscription.status.free_plan')}
                        onPress={() => router.push(isPro ? '/subscription/customer-center' : '/subscription/paywall')}
                        rightElement={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ThemedText style={{ color: colors.primary, fontSize: 13, marginRight: 4 }}>
                                    {isPro ? "Manage" : i18n.t('common.actions.upgrade')}
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
                        subtitle="info@klipphq.com"
                        onPress={handleContactPress}
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

            <Modal
                visible={isEditProfileModalVisible}
                animationType="slide"
                presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
                onRequestClose={handleCloseEditProfileModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={handleCloseEditProfileModal} style={styles.modalCloseButton}>
                            <IconSymbol name="xmark" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <ThemedText style={styles.modalTitle}>Profil Düzenle</ThemedText>
                        <View style={{ width: 32 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                        <View style={styles.companyForm}>
                            <ThemedText style={styles.sectionHelper}>
                                Bu bilgiler faturalarınızda ve paylaşımlarınızda görünecektir.
                            </ThemedText>

                            {/* Row 1: Name & Email */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <ThemedText style={styles.inputLabel}>{i18n.t('profile.company.fields.name')}</ThemedText>
                                    <TextInput
                                        value={profileForm.name}
                                        onChangeText={(text) => handleProfileFieldChange('name', text)}
                                        placeholder={i18n.t('profile.company.placeholders.name')}
                                        autoCapitalize="words"
                                    />
                                </View>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <ThemedText style={styles.inputLabel}>E-posta</ThemedText>
                                    <TextInput
                                        value={profileForm.email}
                                        editable={false}
                                        style={{ backgroundColor: colors.background, opacity: 0.7 }}
                                    />
                                </View>
                            </View>

                            {/* Row 2: Tax Number & Office */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <ThemedText style={styles.inputLabel}>{i18n.t('profile.company.fields.taxNumber')}</ThemedText>
                                    <TextInput
                                        value={profileForm.taxNumber}
                                        onChangeText={(text) => handleProfileFieldChange('taxNumber', text)}
                                        placeholder={i18n.t('profile.company.placeholders.taxNumber')}
                                        keyboardType="number-pad"
                                    />
                                </View>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <ThemedText style={styles.inputLabel}>{i18n.t('profile.company.fields.taxOffice')}</ThemedText>
                                    <TextInput
                                        value={profileForm.taxOffice}
                                        onChangeText={(text) => handleProfileFieldChange('taxOffice', text)}
                                        placeholder={i18n.t('profile.company.placeholders.taxOffice')}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            {/* Row 3: Address */}
                            <View style={styles.inputWrapper}>
                                <ThemedText style={styles.inputLabel}>{i18n.t('profile.company.fields.address')}</ThemedText>
                                <TextInput
                                    value={profileForm.address}
                                    onChangeText={(text) => handleProfileFieldChange('address', text)}
                                    placeholder={i18n.t('profile.company.placeholders.address')}
                                    multiline
                                    numberOfLines={3}
                                    style={styles.multilineInput}
                                />
                            </View>

                            {/* Row 4: City, Subdivision, Phone */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <ThemedText style={styles.inputLabel}>{i18n.t('profile.company.fields.city')}</ThemedText>
                                    <TextInput
                                        value={profileForm.city}
                                        onChangeText={(text) => handleProfileFieldChange('city', text)}
                                        placeholder={i18n.t('profile.company.placeholders.city')}
                                    />
                                </View>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <ThemedText style={styles.inputLabel}>{i18n.t('profile.company.fields.subdivision')}</ThemedText>
                                    <TextInput
                                        value={profileForm.subdivision}
                                        onChangeText={(text) => handleProfileFieldChange('subdivision', text)}
                                        placeholder={i18n.t('profile.company.placeholders.subdivision')}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <ThemedText style={styles.inputLabel}>{i18n.t('profile.company.fields.phone')}</ThemedText>
                                <TextInput
                                    value={profileForm.phone}
                                    onChangeText={(text) => handleProfileFieldChange('phone', text)}
                                    placeholder={i18n.t('profile.company.placeholders.phone')}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <Button
                                title={i18n.t('profile.company.save')}
                                onPress={handleSaveProfile}
                                loading={isSavingProfile}
                                style={styles.profileSaveButton}
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
