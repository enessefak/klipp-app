import { SubscriptionRepository } from '@/src/features/subscription/data/SubscriptionRepository';
import { SubscriptionProduct } from '@/src/features/subscription/domain/SubscriptionProduct';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';

interface SubscriptionContextType {
    products: SubscriptionProduct[];
    isLoading: boolean;
    isPurchasing: boolean;
    purchase: (productId: string) => Promise<boolean>;
    restore: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    products: [],
    isLoading: false,
    isPurchasing: false,
    purchase: async () => false,
    restore: async () => { },
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [products, setProducts] = useState<SubscriptionProduct[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const plans = await SubscriptionRepository.getPlans();
            setProducts(plans);
        } catch (error) {
            console.error('Failed to load subscription plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const purchase = async (productId: string) => {
        setIsPurchasing(true);
        try {
            const checkoutUrl = await SubscriptionRepository.createCheckout(productId);
            if (checkoutUrl) {
                await Linking.openURL(checkoutUrl);
                return true;
            } else {
                Alert.alert('Hata', 'Ödeme sayfası oluşturulamadı.');
                return false;
            }
        } catch (e) {
            console.error('Purchase request failed', e);
            Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
            return false;
        } finally {
            setIsPurchasing(false);
        }
    };

    const restore = async () => {
        // For web-based subscription, restore might just be "check status" which happens on login/app start
        // or we can call a sync endpoint.
        Alert.alert('Bilgi', 'Abonelik durumu güncelleniyor...');
        // await SubscriptionRepository.syncSubscription(); 
        // For now just alert
    };

    return (
        <SubscriptionContext.Provider value={{
            products,
            isLoading,
            isPurchasing,
            purchase,
            restore
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}
