export interface SubscriptionProduct {
    productId: string;
    title: string;
    description: string;
    price: string;
    currencyCode: string;
    pricingPhase?: {
        price: string;
        billingPeriod: string;
    };
}

export const PRODUCT_IDS = {
    PREMIUM_MONTHLY: 'klippmonth',
    PREMIUM_YEARLY: 'klipp',
};
