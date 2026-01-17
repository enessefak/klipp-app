import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Attachment } from '@/src/features/attachments/domain/Attachment';
import { AttachmentCard } from '@/src/features/attachments/presentation/components/AttachmentCard';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

interface InboxTabProps {
    userEmail: string;
    attachments: Attachment[];
    loading: boolean;
    onRefresh: () => void;
    onPressAttachment: (attachment: Attachment) => void;
}

/**
 * InboxTab - Inbox tab content with email instructions and attachments list
 */
export function InboxTab({
    userEmail,
    attachments,
    loading,
    onRefresh,
    onPressAttachment,
}: InboxTabProps) {
    const { colors } = useSettings();
    const [showDetails, setShowDetails] = useState(false);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
        },
        instructionsCard: {
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 8,
        },
        instructionsHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        instructionsIconContainer: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
        },
        instructionsTitle: {
            fontSize: 14,
            color: colors.text,
            flex: 1,
        },
        instructionsBody: {
            marginTop: 4,
        },
        emailText: {
            fontSize: 13,
            color: colors.textLight,
            lineHeight: 18,
        },
        emailHighlight: {
            color: colors.primary,
            fontWeight: '600',
        },
        infoButton: {
            padding: 4,
        },
        detailsContainer: {
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        bulletList: {
            gap: 8,
        },
        bulletItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
        },
        bulletDot: {
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: colors.primary,
            marginTop: 6,
        },
        bulletText: {
            fontSize: 12,
            color: colors.textLight,
            flex: 1,
            lineHeight: 18,
        },
        boldText: {
            fontWeight: '600',
            color: colors.text,
        },
        codeText: {
            fontFamily: 'monospace',
            backgroundColor: colors.inputBackground,
            paddingHorizontal: 4,
            borderRadius: 4,
            color: colors.primary,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        sectionTitle: {
            fontSize: 18,
            color: colors.text,
        },
        sectionSubtitle: {
            fontSize: 13,
            color: colors.textLight,
            marginTop: 2,
        },
        listContent: {
            paddingHorizontal: 16,
            paddingBottom: 100,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
        },
        emptyIcon: {
            marginBottom: 16,
        },
        emptyText: {
            fontSize: 16,
            color: colors.textLight,
            textAlign: 'center',
        },
        emptySubtext: {
            fontSize: 14,
            color: colors.gray,
            textAlign: 'center',
            marginTop: 8,
        },
        attachmentItem: {
            marginBottom: 12,
        },
    }), [colors]);

    const renderInstructions = () => (
        <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
                <View style={styles.instructionsIconContainer}>
                    <IconSymbol name="envelope.fill" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText style={styles.emailText}>
                        Kayıtlı e-posta adresinizden ({' '}
                        <ThemedText style={styles.emailHighlight}>{userEmail}</ThemedText>
                        {' '}) {' '}
                        <ThemedText style={styles.emailHighlight}>inbox@klipphq.com</ThemedText>
                        {' '}adresine mail gönderin.
                    </ThemedText>
                </View>
                <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => setShowDetails(!showDetails)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <IconSymbol
                        name={showDetails ? "chevron.up" : "info.circle"}
                        size={18}
                        color={colors.gray}
                    />
                </TouchableOpacity>
            </View>

            {showDetails && (
                <View style={styles.detailsContainer}>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <View style={styles.bulletDot} />
                            <ThemedText style={styles.bulletText}>
                                Aynı türdeki ekler (örn. 3 resim) tek bir belgede birleştirilir.
                            </ThemedText>
                        </View>
                        <View style={styles.bulletItem}>
                            <View style={styles.bulletDot} />
                            <ThemedText style={styles.bulletText}>
                                Ekleri ayrı belgeler olarak kaydetmek için konu satırına{' '}
                                <ThemedText style={styles.codeText}>#split</ThemedText> ekleyin.
                            </ThemedText>
                        </View>
                        <View style={styles.bulletItem}>
                            <View style={styles.bulletDot} />
                            <ThemedText style={styles.bulletText}>
                                Farklı dosya türleri (PDF+JPG) her zaman ayrı işlenir.
                            </ThemedText>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <IconSymbol
                name="tray.fill"
                size={64}
                color={colors.border}
                style={styles.emptyIcon}
            />
            <ThemedText style={styles.emptyText}>
                {i18n.t('inbox.empty_title', { defaultValue: 'No inbox attachments' })}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
                {i18n.t('inbox.empty_subtitle', { defaultValue: 'Send documents to inbox@klipphq.com' })}
            </ThemedText>
        </View>
    );

    const renderAttachment = ({ item }: { item: Attachment }) => (
        <View style={styles.attachmentItem}>
            <AttachmentCard
                attachment={item}
                onPress={() => onPressAttachment(item)}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {loading && attachments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={attachments}
                    renderItem={renderAttachment}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderInstructions}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
}
