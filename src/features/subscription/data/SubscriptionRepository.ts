import { SubscriptionService } from '@/src/infrastructure/api/generated/services/SubscriptionService';
import { SubscriptionProduct } from '../domain/SubscriptionProduct';

export class SubscriptionRepository {
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

    static async createCheckout(planId: string): Promise<string | null> {
        const response = await SubscriptionService.postSubscriptionCheckout({
            planId: planId as any, // Cast to expected enum or string
            redirectUrl: 'klipp://subscription/success'
        });

        if (response.success && response.data && response.data.url) {
            return response.data.url;
        }
        return null;
    }
}
