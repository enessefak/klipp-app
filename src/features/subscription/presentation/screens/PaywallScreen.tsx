import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { subscriptionService } from '@/src/features/subscription/data/SubscriptionService';
import { PRODUCT_IDS, SubscriptionProduct } from '@/src/features/subscription/domain/SubscriptionProduct';
import i18n from '@/src/infrastructure/localization/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [products, setProducts] = useState<SubscriptionProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            await subscriptionService.initialize();
            const items = await subscriptionService.getProducts();
            setProducts(items);
            // Auto Select Yearly if available, else first one
            const yearly = items.find(p => p.productId === PRODUCT_IDS.PREMIUM_YEARLY);
            if (yearly) {
                setSelectedProduct(yearly.productId);
            } else if (items.length > 0) {
                setSelectedProduct(items[0].productId);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!selectedProduct) return;
        setPurchasing(true);
        try {
            const success = await subscriptionService.purchase(selectedProduct);
            if (success) {
                Alert.alert(
                    i18n.t('subscription.success.title'),
                    i18n.t('subscription.success.message'),
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        } catch (error) {
            Alert.alert(i18n.t('subscription.error.title'), i18n.t('subscription.error.message'));
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        try {
            await subscriptionService.restorePurchases();
            Alert.alert(
                i18n.t('common.actions.success'),
                'Satın alımlar (varsa) geri yüklendi.', // TODO: Add localized string
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(i18n.t('common.error'), 'Geri yükleme başarısız oldu.');
        } finally {
            setPurchasing(false);
        }
    };

    const features = [
        { icon: 'doc.viewfinder', text: i18n.t('subscription.features.unlimited') },
        { icon: 'cloud', text: i18n.t('subscription.features.cloud') },
        { icon: 'arrow.up.doc', text: i18n.t('subscription.features.export') },
        { icon: 'sparkles', text: i18n.t('subscription.features.no_ads') },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0a0a0a', '#1a1a1a']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.iconContainer}>
                        <IconSymbol name="checkmark.seal.fill" size={64} color="#4A90E2" />
                    </View>
                    <ThemedText type="title" style={styles.title}>{i18n.t('subscription.title')}</ThemedText>
                    <ThemedText style={styles.subtitle}>{i18n.t('subscription.subtitle')}</ThemedText>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={styles.featureIcon}>
                                <IconSymbol name={feature.icon as any} size={20} color="#4A90E2" />
                            </View>
                            <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* Products */}
                <View style={styles.products}>
                    {products.map((product) => {
                        const isSelected = selectedProduct === product.productId;
                        return (
                            <TouchableOpacity
                                key={product.productId}
                                style={[styles.productCard, isSelected && styles.productCardSelected]}
                                onPress={() => setSelectedProduct(product.productId)}
                                activeOpacity={0.9}
                            >
                                <View style={styles.productInfo}>
                                    <ThemedText style={styles.productTitle}>{product.title}</ThemedText>
                                    <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                                </View>
                                <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                                    {isSelected && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Cancel Anytime */}
                <ThemedText style={styles.disclaimer}>{i18n.t('subscription.plans.cancel_anytime')}</ThemedText>

                {/* Purchase Button */}
                <Button
                    title={i18n.t('subscription.actions.subscribe')}
                    onPress={handlePurchase}
                    loading={purchasing}
                    disabled={loading || !selectedProduct}
                    size="large"
                    style={styles.subscribeButton}
                />

                {/* Footer Links */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
                        <ThemedText style={styles.footerLink}>{i18n.t('subscription.actions.restore')}</ThemedText>
                    </TouchableOpacity>
                    <View style={styles.footerRow}>
                        <TouchableOpacity>
                            <ThemedText style={styles.footerLink}>{i18n.t('subscription.actions.terms')}</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.footerSeparator}>•</ThemedText>
                        <TouchableOpacity>
                            <ThemedText style={styles.footerLink}>{i18n.t('subscription.actions.privacy')}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        marginBottom: 8,
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    features: {
        marginBottom: 40,
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    products: {
        gap: 12,
        marginBottom: 24,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    productCardSelected: {
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
    },
    productInfo: {
        gap: 4,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4A90E2',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: '#4A90E2',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4A90E2',
    },
    disclaimer: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginBottom: 24,
    },
    subscribeButton: {
        marginBottom: 24,
        backgroundColor: '#4A90E2', // Primary color overriding default
    },
    footer: {
        alignItems: 'center',
        gap: 16,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerLink: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    footerSeparator: {
        color: 'rgba(255,255,255,0.3)',
    }
});
