import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOfferings } from 'react-native-purchases';
import { SubscriptionRepository } from '@/src/features/subscription/data/SubscriptionRepository';

interface RevenueCatContextType {
    isPro: boolean;
    customerInfo: CustomerInfo | null;
    offerings: PurchasesOfferings | null;
    isLoading: boolean;
    restorePurchases: () => Promise<CustomerInfo | null>;
    refreshOfferings: () => Promise<PurchasesOfferings | null>;
    refreshSubscriptionStatus: (forceSync?: boolean) => Promise<ExternalSubscriptionStatus | null>;
    hasExternalSubscription: boolean;
    externalSubscription: ExternalSubscriptionStatus | null;
}

interface ExternalSubscriptionStatus {
    isValid: boolean;
    status: string;
    planId: string | null;
    provider: string | null;
    subscriptionEndDate: string | null;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

// Get API keys from environment variables
const IOS_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'appl_YOUR_IOS_API_KEY_HERE';
const ANDROID_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || 'goog_YOUR_ANDROID_API_KEY_HERE';

export const RevenueCatProvider = ({ children, userId }: { children: React.ReactNode; userId?: string }) => {
    const [isPro, setIsPro] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasExternalSubscription, setHasExternalSubscription] = useState(false);
    const [externalSubscription, setExternalSubscription] = useState<ExternalSubscriptionStatus | null>(null);

    const revenueCatEntitlementRef = useRef(false);
    const backendSubscriptionRef = useRef(false);

    const updateProStatus = useCallback((rcStatus?: boolean, backendStatus?: boolean) => {
        if (typeof rcStatus === 'boolean') {
            revenueCatEntitlementRef.current = rcStatus;
        }
        if (typeof backendStatus === 'boolean') {
            backendSubscriptionRef.current = backendStatus;
        }
        setIsPro(revenueCatEntitlementRef.current || backendSubscriptionRef.current);
    }, []);

    const fetchOfferings = async () => {
        try {
            const availableOfferings = await Purchases.getOfferings();
            setOfferings(availableOfferings);
            return availableOfferings;
        } catch (error) {
            console.error('RevenueCat getOfferings error', error);
            throw error;
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                console.log('RevenueCat Init - IOS_API_KEY:', IOS_API_KEY);
                console.log('RevenueCat Init - ANDROID_API_KEY:', ANDROID_API_KEY);
                console.log('RevenueCat Init - Platform:', Platform.OS);
                console.log('RevenueCat Init - Extra config:', Constants.expoConfig?.extra);

                Purchases.setLogLevel(LOG_LEVEL.DEBUG);

                // Configure with platform-specific API key
                const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;

                if (userId) {
                    // Configure with user ID for cross-platform sync
                    Purchases.configure({ apiKey, appUserID: userId });
                } else {
                    // Configure without user ID (anonymous)
                    Purchases.configure({ apiKey });
                }

                // Get initial customer info
                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info);
                checkEntitlements(info);

                // Load offerings
                await fetchOfferings();
            } catch (e) {
                console.error("RevenueCat init error", e);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [userId]);

    useEffect(() => {
        const customerInfoUpdated = (info: CustomerInfo) => {
            setCustomerInfo(info);
            checkEntitlements(info);
        };
        Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
        return () => {
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
        };
    }, []);

    const checkEntitlements = (info: CustomerInfo) => {
        const hasPro = Boolean(info.entitlements.active['pro_access']);
        updateProStatus(hasPro, undefined);
    };

    const syncBackendSubscription = useCallback(async (forceSync = false): Promise<ExternalSubscriptionStatus | null> => {
        if (!userId) {
            setExternalSubscription(null);
            setHasExternalSubscription(false);
            updateProStatus(undefined, false);
            return null;
        }

        try {
            const result = await SubscriptionRepository.verifySubscription(forceSync);
            const normalized: ExternalSubscriptionStatus = {
                isValid: !!result?.isValid,
                status: result?.status || (result?.isValid ? 'active' : 'inactive'),
                planId: result?.planId || null,
                provider: result?.provider || null,
                subscriptionEndDate: result?.subscriptionEndDate || null,
            };

            setExternalSubscription(normalized);
            setHasExternalSubscription(normalized.isValid);
            updateProStatus(undefined, normalized.isValid);
            return normalized;
        } catch (error) {
            console.error('Backend subscription check failed', error);
            return null;
        }
    }, [updateProStatus, userId]);

    useEffect(() => {
        if (userId) {
            syncBackendSubscription(false);
        } else {
            setExternalSubscription(null);
            setHasExternalSubscription(false);
            updateProStatus(false, false);
        }
    }, [syncBackendSubscription, updateProStatus, userId]);

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            checkEntitlements(info);
            await syncBackendSubscription(true);
            return info;
        } catch (e) {
            console.error("Restore error", e);
            return null;
        }
    };

    const refreshOfferings = async () => {
        setIsLoading(true);
        try {
            return await fetchOfferings();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RevenueCatContext.Provider
            value={{
                isPro,
                customerInfo,
                offerings,
                isLoading,
                restorePurchases,
                refreshOfferings,
                refreshSubscriptionStatus: syncBackendSubscription,
                hasExternalSubscription,
                externalSubscription,
            }}
        >
            {children}
        </RevenueCatContext.Provider>
    );
};

export const useRevenueCat = () => {
    const context = useContext(RevenueCatContext);
    if (!context) {
        throw new Error('useRevenueCat must be used within a RevenueCatProvider');
    }
    return context;
};
