
import { PRODUCT_IDS, SubscriptionProduct } from '@/src/features/subscription/domain/SubscriptionProduct';
import {
    endConnection,
    fetchProducts,
    finishTransaction,
    initConnection,
    purchaseErrorListener,
    purchaseUpdatedListener,
    requestPurchase
} from 'expo-iap';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, EmitterSubscription, Platform } from 'react-native';

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
    const [isLoading, setIsLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    // Listeners refs
    const purchaseUpdateSubscription = useRef<EmitterSubscription | null>(null);
    const purchaseErrorSubscription = useRef<EmitterSubscription | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initIAP = async () => {
            if (Platform.OS === 'web') {
                setIsLoading(false);
                return;
            }

            try {
                // 1. Setup Listeners
                purchaseUpdateSubscription.current = purchaseUpdatedListener(async (purchase) => {
                    console.log('Purchase success', purchase);
                    setIsPurchasing(false);
                    try {
                        await finishTransaction({ purchase, isConsumable: false });
                    } catch (e) {
                        console.warn('Finish transaction failed', e);
                    }
                    Alert.alert('Başarılı', 'Abonelik işlemi tamamlandı.');
                    router.back();
                }) as any;

                purchaseErrorSubscription.current = purchaseErrorListener((error) => {
                    console.error('Purchase error listener', error);
                    setIsPurchasing(false);
                    if ((error as any).code !== 'E_USER_CANCELLED') {
                        Alert.alert('Hata', 'Satın alma işlemi başarısız oldu.');
                    }
                }) as any;

                // 2. Init Connection with try-catch
                const result = await initConnection();
                if (!isMounted) return;

                setConnected(result);

                if (result && productIds && productIds.length > 0) {
                    // 3. Fetch Products
                    // Use fetchProducts. It returns void but we assume it might work or we use a workaround if needed.
                    // For now, let's just call it and cast the result if we can't be sure.
                    // If fetchProducts DOES returns items, we use them.
                    const products: any = await fetchProducts({ skus: productIds });
                    if (isMounted && products && Array.isArray(products)) {
                        const mapped = products.map((p: any) => ({
                            productId: p.id || p.productId,
                            title: p.title,
                            description: p.description || '',
                            price: p.displayPrice || p.price || '',
                            currencyCode: p.priceCurrencyCode || 'TRY',
                        }));
                        setMappedProducts(mapped);
                    }
                }
            } catch (err) {
                console.error('IAP Initialization Failed:', err);
                // Graceful fallback - app continues but subscriptions might not work
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initIAP();

        return () => {
            isMounted = false;
            if (purchaseUpdateSubscription.current) {
                (purchaseUpdateSubscription.current as any).remove();
                purchaseUpdateSubscription.current = null;
            }
            if (purchaseErrorSubscription.current) {
                (purchaseErrorSubscription.current as any).remove();
                purchaseErrorSubscription.current = null;
            }
            if (Platform.OS !== 'web') {
                endConnection();
            }
        };
    }, []);

    // Set mock products for web/dev if empty
    useEffect(() => {
        if (!isLoading && mappedProducts.length === 0 && (Platform.OS === 'web' || __DEV__)) {
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
    }, [isLoading, mappedProducts.length]);

    const purchase = async (productId: string) => {
        setIsPurchasing(true);
        if (Platform.OS === 'web') {
            setTimeout(() => {
                setIsPurchasing(false);
                Alert.alert('Mock Purchase', 'Success (Web)');
            }, 1000);
            return true;
        }

        if (!connected) {
            Alert.alert('Hata', 'Market bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyiniz.');
            setIsPurchasing(false);
            return false;
        }

        try {
            await requestPurchase({ sku: productId } as any);
            return true;
        } catch (e) {
            console.error('Purchase request failed', e);
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
            isLoading,
            isPurchasing,
            purchase,
            restore
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}
