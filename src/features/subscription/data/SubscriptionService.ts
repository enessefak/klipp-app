import * as IAP from 'expo-in-app-purchases';
import { PRODUCT_IDS, SubscriptionProduct } from '../domain/SubscriptionProduct';

class SubscriptionService {
    private connected = false;
    private connectionPromise: Promise<void> | null = null;
    private productsPromise: Promise<SubscriptionProduct[]> | null = null;
    private products: SubscriptionProduct[] = [];

    async initialize(): Promise<void> {
        if (this.connected) return;

        // If connection is already in progress, wait for it
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = (async () => {
            try {
                console.log('[IAP] Connecting to store...');
                await IAP.connectAsync();
                this.connected = true;
                console.log('[IAP] Store Connected successfully');

                IAP.setPurchaseListener(({ responseCode, results, errorCode }) => {
                    console.log(`[IAP] Purchase Listener Event. Code: ${responseCode}, Error: ${errorCode}`);
                    if (responseCode === IAP.IAPResponseCode.OK) {
                        if (results) {
                            results.forEach(purchase => {
                                if (!purchase.acknowledged) {
                                    console.log('[IAP] Handling unacknowledged purchase:', purchase.productId);
                                    this.handlePurchase(purchase);
                                } else {
                                    console.log('[IAP] Finishing already acknowledged transaction');
                                    IAP.finishTransactionAsync(purchase, true);
                                }
                            });
                        }
                    } else if (responseCode === IAP.IAPResponseCode.USER_CANCELED) {
                        console.log('[IAP] User canceled the transaction');
                    } else {
                        console.warn(`[IAP] Purchase error. Error code: ${errorCode}`);
                    }
                });
            } catch (error) {
                console.warn('[IAP] Connection failed detailed error:', error);
                // Reset promise on failure so we can try again
                this.connectionPromise = null;
            }
        })();

        return this.connectionPromise;
    }

    async getProducts(): Promise<SubscriptionProduct[]> {
        if (!this.connected) {
            // Return mock products for development/simulator
            return this.getMockProducts();
        }

        if (this.productsPromise) {
            return this.productsPromise;
        }

        this.productsPromise = (async () => {
            try {
                const items = Object.values(PRODUCT_IDS);
                console.log('[IAP] Fetching products for IDs:', items);

                const { results } = await IAP.getProductsAsync(items);
                console.log('[IAP] Raw product results:', JSON.stringify(results, null, 2));

                if (results && results.length > 0) {
                    console.log('[IAP] Found valid products, mapping them...');
                    return results.map(item => ({
                        productId: item.productId,
                        title: item.title,
                        description: item.description,
                        price: item.price,
                        currencyCode: item.priceCurrencyCode,
                    }));
                }

                console.warn('[IAP] No products found in store response, falling back to mock.');
                return this.getMockProducts(); // Fallback if no products found (e.g. unconfigured)
            } catch (error) {
                console.error('[IAP] Error fetching products:', error);
                return this.getMockProducts();
            } finally {
                this.productsPromise = null;
            }
        })();

        return this.productsPromise;
    }

    async purchase(productId: string): Promise<boolean> {
        if (!this.connected) {
            console.log('Mock purchase successful');
            return true;
        }

        try {
            await IAP.purchaseItemAsync(productId);
            return true;
        } catch (error) {
            console.error('[IAP] Purchase failed:', error);
            throw error;
        }
    }

    async restorePurchases(): Promise<void> {
        if (!this.connected) {
            console.log('[IAP] Mock restore successful');
            return;
        }

        try {
            console.log('[IAP] Restoring purchases...');
            // According to Expo docs, getPurchaseHistoryAsync is used for restoring
            // But usually connectAsync handles the initial restore of unconsumed/active items.
            // Explicit check:
            const { responseCode, results } = await IAP.getPurchaseHistoryAsync();

            if (responseCode === IAP.IAPResponseCode.OK && results) {
                console.log('[IAP] Restore history:', results);
                results.forEach(purchase => {
                    // Check logic here - usually you send receipt to backend
                    this.handlePurchase(purchase);
                });
            } else {
                console.warn('[IAP] Restore failed or empty history. Code:', responseCode);
                throw new Error('Restore failed');
            }
        } catch (error) {
            console.error('[IAP] Restore error:', error);
            throw error;
        }
    }

    private async handlePurchase(purchase: IAP.InAppPurchase) {
        try {
            // Verify with backend
            // Note: The API call requires platform specific receipt data
            // const receipt = purchase.transactionReceipt;

            // For now, allow finish transaction to avoid stuck queue 
            // Real implementation should await backend verification response

            /* 
            await ApiSubscriptionService.postSubscriptionsVerify({
                receipt: purchase.transactionReceipt,
                platform: Platform.OS
            }); 
            */

            console.log('Purchase successful, finishing transaction');
            await IAP.finishTransactionAsync(purchase, true);
        } catch (error) {
            console.error('Receipt verification failed:', error);
        }
    }

    // Mock data for UI development
    private getMockProducts(): SubscriptionProduct[] {
        return [
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
            }
        ];
    }

    async disconnect() {
        if (this.connected) {
            await IAP.disconnectAsync();
            this.connected = false;
        }
    }
}

export const subscriptionService = new SubscriptionService();
