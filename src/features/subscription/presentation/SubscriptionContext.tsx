import { PRODUCT_IDS, SubscriptionProduct } from '@/src/features/subscription/domain/SubscriptionProduct';
import { useIAP } from 'expo-iap';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

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

const productIds = Platform.select({
    ios: [PRODUCT_IDS.PREMIUM_MONTHLY, PRODUCT_IDS.PREMIUM_YEARLY],
    android: [PRODUCT_IDS.PREMIUM_MONTHLY, PRODUCT_IDS.PREMIUM_YEARLY],
    default: [],
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [mappedProducts, setMappedProducts] = useState<SubscriptionProduct[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const {
        connected,
        products,
        fetchProducts,
        requestPurchase,
        finishTransaction,
    } = useIAP({
        onPurchaseSuccess: async (purchase) => {
            setIsPurchasing(false);
            console.log('Purchase success', purchase);
            await finishTransaction({ purchase, isConsumable: false });
            Alert.alert('Başarılı', 'Abonelik işlemi tamamlandı.');
            router.back();
        },
        onPurchaseError: (error) => {
            setIsPurchasing(false);
            console.error('Purchase error', error);
            if (error.code !== 'E_USER_CANCELLED') {
                Alert.alert('Hata', 'Satın alma işlemi başarısız oldu.');
            }
        }
    });

    useEffect(() => {
        if (connected && productIds && productIds.length > 0) {
            fetchProducts({ skus: productIds });
        }
    }, [connected]);

    useEffect(() => {
        if (products && products.length > 0) {
            // Map expo-iap products to our domain model
            // expo-iap Product structure differs from our SubscriptionProduct
            const mapped = products.map((p: any) => ({
                productId: p.id || p.productId,
                title: p.title,
                description: p.description || '',
                price: p.displayPrice || p.price || '',
                currencyCode: p.priceCurrencyCode || 'TRY',
            }));
            setMappedProducts(mapped);
        } else {
            // Mock products for dev/web if no real products fetched
            // Only set mock if we intend to show something
            if ((Platform.OS === 'web' || __DEV__) && mappedProducts.length === 0) {
                setMappedProducts([
                    {
                        productId: PRODUCT_IDS.PREMIUM_MONTHLY,
                        title: 'Klipp Premium (Aylık)',
                        description: 'Sınırsız belge tarama ve bulut yedekleme',
                        price: '₺49.99',
                        currencyCode: 'TRY',
                    },
                    {
                        productId: PRODUCT_IDS.PREMIUM_YEARLY,
                        title: 'Klipp Premium (Yıllık)',
                        description: 'Yıllık ödeyin, %20 tasarruf edin',
                        price: '₺499.99',
                        currencyCode: 'TRY',
                    },
                ]);
            }
        }
    }, [products, connected]);

    const purchase = async (productId: string) => {
        setIsPurchasing(true);
        if (Platform.OS === 'web') {
            setTimeout(() => {
                setIsPurchasing(false);
                Alert.alert('Mock Purchase', 'Success (Web)');
            }, 1000);
            return true;
        }
        try {
            await requestPurchase({ sku: productId });
            return true;
        } catch (e) {
            console.error(e);
            setIsPurchasing(false);
            return false;
        }
    };

    const restore = async () => {
        Alert.alert('Bilgi', 'Geri yükleme işlemi henüz bu sağlayıcı ile tam entegre değil.');
        return Promise.resolve();
    };

    return (
        <SubscriptionContext.Provider value={{
            products: mappedProducts,
            isLoading: !connected && Platform.OS !== 'web',
            isPurchasing,
            purchase,
            restore
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}
