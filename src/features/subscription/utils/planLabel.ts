export function formatSubscriptionPlan(planId?: string | null): string | null {
    if (!planId) return null;

    return planId
        .split(/[ _-]+/)
        .filter(Boolean)
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}

export type SubscriptionProviderKey = 'web' | 'lemonsqueezy' | 'apple' | 'google' | 'generic';

export function resolveSubscriptionProviderKey(provider?: string | null): SubscriptionProviderKey {
    const normalized = provider?.toLowerCase() || '';

    if (normalized.includes('web')) return 'web';
    if (normalized.includes('lemon')) return 'lemonsqueezy';
    if (normalized.includes('apple')) return 'apple';
    if (normalized.includes('google')) return 'google';

    return 'generic';
}
