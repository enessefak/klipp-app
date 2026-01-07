import React, { createContext, useContext, useEffect, useState } from 'react';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

interface RevenueCatContextType {
    isPro: boolean;
    customerInfo: CustomerInfo | null;
    restorePermissions: () => Promise<CustomerInfo | null>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

// Use the API key provided by the user
const API_KEY = 'test_kJTQQiwxWkgufePcsVoqglXWvpr';

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
    const [isPro, setIsPro] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

    useEffect(() => {
        const init = async () => {
            Purchases.setLogLevel(LOG_LEVEL.WARN);

            // Configure with the same key for both platforms as requested, 
            // or usually you'd have different keys for iOS/Android.
            // The user provided one key, assuming it's for the current platform or a universal one if that existed (it doesn't usually).
            // But for this task I will use the provided key.
            Purchases.configure({ apiKey: API_KEY });

            try {
                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info);
                checkEntitlements(info);
            } catch (e) {
                console.error("RevenueCat init error", e);
            }
        };

        init();
    }, []);

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
        // Check for 'klipp Pro' entitlement as requested
        if (info.entitlements.active['pro_access']) {
            setIsPro(true);
        } else {
            setIsPro(false);
        }
    };

    const restorePermissions = async () => {
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
        <RevenueCatContext.Provider value={{ isPro, customerInfo, restorePermissions }}>
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
