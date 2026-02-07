import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOfferings } from 'react-native-purchases';

interface RevenueCatContextType {
    isPro: boolean;
    customerInfo: CustomerInfo | null;
    offerings: PurchasesOfferings | null;
    isLoading: boolean;
    restorePurchases: () => Promise<CustomerInfo | null>;
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

    useEffect(() => {
        const init = async () => {
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
                const availableOfferings = await Purchases.getOfferings();
                setOfferings(availableOfferings);
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
        // Check for 'pro_access' entitlement
        if (info.entitlements.active['pro_access']) {
            setIsPro(true);
        } else {
            setIsPro(false);
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            checkEntitlements(info);
            return info;
        } catch (e) {
            console.error("Restore error", e);
            return null;
        }
    };

    return (
        <RevenueCatContext.Provider value={{ isPro, customerInfo, offerings, isLoading, restorePurchases }}>
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
