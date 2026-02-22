import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatSubscriptionPlan, resolveSubscriptionProviderKey } from '@/src/features/subscription/utils/planLabel';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRevenueCat } from '@/src/infrastructure/revenuecat/RevenueCatProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CustomerInfo, PurchasesError } from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WEB_DASHBOARD_URL = 'https://klipphq.com/auth/login?redirect=%2Fdashboard';

export function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        offerings,
        isLoading,
        refreshOfferings,
        refreshSubscriptionStatus,
        hasExternalSubscription,
        externalSubscription,
    } = useRevenueCat();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const currentOffering = offerings?.current ?? null;
    const isBusy = isLoading || isRefreshing;

    const formattedPlan = useMemo(
        () => formatSubscriptionPlan(externalSubscription?.planId),
        [externalSubscription?.planId]
    );
    const providerKey = resolveSubscriptionProviderKey(externalSubscription?.provider);
    const providerLabel = i18n.t(`subscription.providers.${providerKey}`);
    const isWebManaged = providerKey === 'web' || providerKey === 'lemonsqueezy';
    const externalDescriptionKey = isWebManaged
        ? 'subscription.external.webDescription'
        : 'subscription.external.description';

    useEffect(() => {
        refreshSubscriptionStatus(true);
    }, [refreshSubscriptionStatus]);

    const handleClose = () => {
        router.back();
    };

    const handleOpenWebDashboard = () => {
        Linking.openURL(WEB_DASHBOARD_URL);
    };

    const handlePurchaseCompleted = ({ customerInfo }: { customerInfo: CustomerInfo }) => {
        if (customerInfo.entitlements.active['pro_access']) {
            router.replace('/subscription/customer-center');
        }
    };

    const handlePurchaseError = ({ error }: { error: PurchasesError }) => {
        Alert.alert(i18n.t('subscription.error.title'), error?.message || i18n.t('subscription.error.message'));
    };

    const handleRestoreCompleted = ({ customerInfo }: { customerInfo: CustomerInfo }) => {
        if (customerInfo.entitlements.active['pro_access']) {
            router.replace('/subscription/customer-center');
        } else {
            Alert.alert(i18n.t('subscription.error.title'), i18n.t('subscription.error.message'));
        }
    };

    const handleRetry = async () => {
        setIsRefreshing(true);
        try {
            await refreshOfferings();
        } catch (error) {
            Alert.alert(i18n.t('subscription.error.title'), i18n.t('subscription.error.message'));
        } finally {
            setIsRefreshing(false);
        }
    };

    const renderFallback = () => (
        <View style={styles.fallback}>
            {isBusy ? (
                <>
                    <ActivityIndicator color="#fff" />
                    <ThemedText style={styles.loadingText}>{i18n.t('subscription.states.loading')}</ThemedText>
                </>
            ) : (
                <>
                    <View style={styles.fallbackBadge}>
                        <IconSymbol name="hare.fill" size={28} color="#4A90E2" />
                    </View>
                    <ThemedText style={styles.fallbackTitle}>{i18n.t('subscription.states.offeringsUnavailable')}</ThemedText>
                    <ThemedText style={styles.fallbackSubtitle}>{i18n.t('subscription.poweredBy.subtitle')}</ThemedText>
                    <Button
                        title={i18n.t('subscription.actions.retry')}
                        onPress={handleRetry}
                        loading={isRefreshing}
                        disabled={isRefreshing}
                        style={styles.retryButton}
                    />
                </>
            )}
        </View>
    );

    if (hasExternalSubscription) {
        return (
            <View style={[styles.container, styles.externalContainer, { paddingTop: insets.top + 24 }]}>
                <View style={styles.externalCard}>
                    <View style={styles.externalIconWrap}>
                        <IconSymbol name="checkmark.seal.fill" size={28} color="#4A90E2" />
                    </View>
                    <ThemedText style={styles.externalTitle}>{i18n.t('subscription.external.title')}</ThemedText>
                    <ThemedText style={styles.externalSubtitle}>
                        {i18n.t(externalDescriptionKey, { provider: providerLabel })}
                    </ThemedText>
                    {formattedPlan && (
                        <ThemedText style={styles.externalMeta}>
                            {i18n.t('subscription.external.planLabel', { plan: formattedPlan })}
                        </ThemedText>
                    )}
                    <ThemedText style={styles.externalMeta}>
                        {i18n.t('subscription.external.providerInfo', { provider: providerLabel })}
                    </ThemedText>
                </View>
                {isWebManaged && (
                    <Button
                        title={i18n.t('subscription.external.openWeb')}
                        onPress={handleOpenWebDashboard}
                        size="large"
                        variant="outline"
                        style={styles.externalButton}
                    />
                )}
                <Button
                    title={i18n.t('subscription.external.close')}
                    onPress={handleClose}
                    size="large"
                    style={styles.externalButton}
                />

                <TouchableOpacity
                    style={[styles.closeButton, { top: insets.top + 12 }]}
                    onPress={handleClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                >
                    <IconSymbol name="xmark" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {currentOffering ? (
                <>
                    <RevenueCatUI.Paywall
                        style={styles.paywall}
                        options={{
                            offering: currentOffering,
                            displayCloseButton: false,
                        }}
                        onPurchaseCompleted={handlePurchaseCompleted}
                        onPurchaseError={handlePurchaseError}
                        onPurchaseCancelled={() => console.log('RevenueCat purchase cancelled')}
                        onRestoreCompleted={handleRestoreCompleted}
                        onRestoreError={handlePurchaseError}
                        onDismiss={handleClose}
                    />
                    <View style={styles.poweredBy} pointerEvents="none">
                        <IconSymbol name="hare.fill" size={14} color="#4A90E2" />
                        <ThemedText style={styles.poweredByText}>{i18n.t('subscription.poweredBy.title')}</ThemedText>
                    </View>
                </>
            ) : (
                renderFallback()
            )}

            <TouchableOpacity
                style={[styles.closeButton, { top: insets.top + 12 }]}
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
            >
                <IconSymbol name="xmark" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    externalContainer: {
        paddingHorizontal: 24,
        justifyContent: 'center',
        gap: 24,
    },
    paywall: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 2,
    },
    fallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 20,
    },
    fallbackBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(74,144,226,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackTitle: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    fallbackSubtitle: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.8)',
    },
    retryButton: {
        alignSelf: 'stretch',
    },
    poweredBy: {
        position: 'absolute',
        bottom: 32,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    poweredByText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    externalCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 12,
    },
    externalIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(74,144,226,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    externalTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    externalSubtitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 15,
    },
    externalMeta: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 14,
    },
    externalButton: {
        alignSelf: 'stretch',
    },
});