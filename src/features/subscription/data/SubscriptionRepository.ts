import { SubscriptionService } from '@/src/infrastructure/api/generated/services/SubscriptionService';
import { SubscriptionProduct } from '../domain/SubscriptionProduct';

export class SubscriptionRepository {
    /**
     * Get subscription plans from backend (LemonSqueezy)
     * This is kept for web-based fallback or display purposes
     */
    static async getPlans(): Promise<SubscriptionProduct[]> {
        const response = await SubscriptionService.getSubscriptionPlans();
        if (response.success && response.data) {
            return response.data.map((p: any) => ({
                productId: p.id,
                title: p.name,
                description: p.description || '',
                price: p.priceFormatted || `${p.price} ${p.currency}`,
                currencyCode: p.currency,
            }));
        }
        return [];
    }

    /**
     * Verify subscription status with backend
     * This checks both LemonSqueezy and RevenueCat subscriptions
     */
    static async verifySubscription(forceSync: boolean = false): Promise<{
        isValid: boolean;
        status: string;
        planId: string | null;
        provider: string | null;
        subscriptionEndDate: string | null;
    }> {
        const response = await SubscriptionService.postSubscriptionVerify({
            forceSync
        });

        if (response.success && response.data) {
            return response.data as any;
        }

        return {
            isValid: false,
            status: 'inactive',
            planId: null,
            provider: null,
            subscriptionEndDate: null
        };
    }
}
