import { SubscriptionProduct } from '@/src/features/subscription/domain/SubscriptionProduct';
import { useRevenueCat } from '@/src/infrastructure/revenuecat/RevenueCatProvider';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

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
    const { offerings, isLoading: isRevenueCatLoading, restorePurchases } = useRevenueCat();
    const [products, setProducts] = useState<SubscriptionProduct[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [packageMap, setPackageMap] = useState<Map<string, PurchasesPackage>>(new Map());

    useEffect(() => {
        loadProducts();
    }, [offerings]);

    const loadProducts = async () => {
        try {
            if (!offerings || !offerings.current) {
                console.log('No offerings available');
                return;
            }

            const currentOffering = offerings.current;
            const availablePackages = currentOffering.availablePackages;

            // Create a map of product ID to package for easy lookup during purchase
            const map = new Map<string, PurchasesPackage>();

            const productList: SubscriptionProduct[] = availablePackages.map((pkg) => {
                const productId = pkg.product.identifier;
                map.set(productId, pkg);

                return {
                    productId,
                    title: pkg.product.title,
                    description: pkg.product.description,
                    price: pkg.product.priceString,
                    currencyCode: pkg.product.currencyCode,
                };
            });

            setPackageMap(map);
            setProducts(productList);
        } catch (error) {
            console.error('Failed to load subscription plans:', error);
        }
    };

    const purchase = async (productId: string) => {
        setIsPurchasing(true);
        try {
            const pkg = packageMap.get(productId);
            if (!pkg) {
                Alert.alert('Hata', 'Ürün bulunamadı.');
                return false;
            }

            const { customerInfo } = await Purchases.purchasePackage(pkg);

            // Check if purchase was successful
            if (customerInfo.entitlements.active['pro_access']) {
                Alert.alert('Başarılı!', 'Aboneliğiniz aktif edildi.');
                router.push('/subscription/customer-center');
                return true;
            } else {
                Alert.alert('Bilgi', 'Satın alma işlemi tamamlandı.');
                return true;
            }
        } catch (e: any) {
            if (e.userCancelled) {
                console.log('User cancelled purchase');
                return false;
            }
            console.error('Purchase failed', e);
            Alert.alert('Hata', e.message || 'Satın alma işlemi başarısız oldu.');
            return false;
        } finally {
            setIsPurchasing(false);
        }
    };

    const restore = async () => {
        try {
            const customerInfo = await restorePurchases();
            if (customerInfo && customerInfo.entitlements.active['pro_access']) {
                Alert.alert('Başarılı!', 'Aboneliğiniz geri yüklendi.');
            } else {
                Alert.alert('Bilgi', 'Geri yüklenecek abonelik bulunamadı.');
            }
        } catch (e) {
            console.error('Restore failed', e);
            Alert.alert('Hata', 'Geri yükleme işlemi başarısız oldu.');
        }
    };

    return (
        <SubscriptionContext.Provider value={{
            products,
            isLoading: isRevenueCatLoading,
            isPurchasing,
            purchase,
            restore
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}
