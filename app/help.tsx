import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { HelpDocumentsService } from '@/src/infrastructure/api/generated/services/HelpDocumentsService';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HelpDocument {
    id: string;
    title: string;
    content: string;
    category: string;
    locale: string;
    platforms: string[];
    keywords: string[];
    priority: number;
}

const CATEGORY_LABELS: Record<string, { tr: string; en: string; de: string; icon: string }> = {
    app_usage: { tr: 'Uygulama Kullanımı', en: 'App Usage', de: 'App-Nutzung', icon: 'iphone' },
    einvoice: { tr: 'E-Fatura & E-Arşiv', en: 'E-Invoice & E-Archive', de: 'E-Rechnung', icon: 'doc.text' },
    subscription: { tr: 'Abonelik & Ödeme', en: 'Subscription & Payment', de: 'Abonnement & Zahlung', icon: 'creditcard' },
    general: { tr: 'Genel', en: 'General', de: 'Allgemein', icon: 'questionmark.circle' }
};

export default function HelpScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { language } = useSettings();
    const [documents, setDocuments] = useState<HelpDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Map language to API locale
    const locale = language || 'tr';

    const theme = {
        background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
        text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        primary: '#007AFF',
        muted: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
        mutedForeground: colorScheme === 'dark' ? '#8E8E93' : '#3C3C43',
        border: colorScheme === 'dark' ? '#38383A' : '#E5E5EA',
    };

    useEffect(() => {
        loadDocuments();
    }, [locale]); // Reload when language changes

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await HelpDocumentsService.getHelpDocumentsPublic(
                undefined,  // category
                locale,     // locale
                'mobile'    // platform
            );

            if (response.success && response.data) {
                // Sort by priority and category
                const sorted = [...response.data].sort((a, b) => {
                    if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                    }
                    return (b.priority || 0) - (a.priority || 0);
                });
                setDocuments(sorted as HelpDocument[]);
            }
        } catch (error) {
            console.error('Failed to load help documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupedDocs = documents.reduce((acc, doc) => {
        if (!acc[doc.category]) {
            acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, HelpDocument[]>);

    const renderDocument = (doc: HelpDocument) => {
        const isExpanded = expandedId === doc.id;

        return (
            <TouchableOpacity
                key={doc.id}
                onPress={() => setExpandedId(isExpanded ? null : doc.id)}
                style={{
                    backgroundColor: theme.muted,
                    borderRadius: 12,
                    marginHorizontal: 16,
                    marginVertical: 6,
                    overflow: 'hidden'
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    justifyContent: 'space-between'
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: theme.text,
                        flex: 1
                    }}>
                        {doc.title}
                    </Text>
                    <IconSymbol
                        name={isExpanded ? "chevron.up" : "chevron.down"}
                        size={16}
                        color={theme.mutedForeground}
                    />
                </View>

                {isExpanded && (
                    <View style={{
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        borderTopWidth: 1,
                        borderTopColor: theme.border
                    }}>
                        <Text style={{
                            fontSize: 15,
                            color: theme.mutedForeground,
                            lineHeight: 22,
                            paddingTop: 12
                        }}>
                            {doc.content}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderCategory = (category: string, docs: HelpDocument[]) => {
        const label = CATEGORY_LABELS[category] || { tr: category, en: category, de: category, icon: 'folder' };
        const categoryLabel = locale === 'de' ? label.de : (locale === 'en' ? label.en : label.tr);

        return (
            <View key={category} style={{ marginBottom: 24 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    marginBottom: 12
                }}>
                    <IconSymbol name={label.icon as any} size={20} color={theme.primary} />
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: theme.text,
                        marginLeft: 8
                    }}>
                        {categoryLabel}
                    </Text>
                </View>
                {docs.map(renderDocument)}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.border
            }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                    <IconSymbol name="xmark" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    marginLeft: 16,
                    color: theme.text
                }}>
                    {i18n.t('profile.settings.help') || 'Help'}
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : documents.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                    <IconSymbol name="doc.questionmark" size={48} color={theme.mutedForeground} />
                    <Text style={{
                        fontSize: 16,
                        color: theme.mutedForeground,
                        marginTop: 16,
                        textAlign: 'center'
                    }}>
                        {i18n.t('help.noDocuments') || 'No help documents available.'}
                    </Text>
                </View>
            ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
                    {Object.entries(groupedDocs).map(([category, docs]) =>
                        renderCategory(category, docs)
                    )}

                    {/* Contact Support */}
                    <View style={{
                        marginHorizontal: 16,
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: theme.muted,
                        borderRadius: 12,
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 15,
                            color: theme.mutedForeground,
                            textAlign: 'center',
                            marginBottom: 12
                        }}>
                            {i18n.t('help.cantFind') || "Can't find what you're looking for?"}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                router.back();
                                setTimeout(() => router.push('/chat' as any), 100);
                            }}
                            style={{
                                backgroundColor: theme.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 20
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>
                                {i18n.t('help.talkToAssistant') || 'Talk to Assistant'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
