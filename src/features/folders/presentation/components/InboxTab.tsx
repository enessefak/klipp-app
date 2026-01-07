import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Attachment } from '@/src/features/attachments/domain/Attachment';
import { AttachmentCard } from '@/src/features/attachments/presentation/components/AttachmentCard';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

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

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
        },
        instructionsCard: {
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            padding: 16,
            margin: 16,
            marginBottom: 8,
        },
        instructionsHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
        },
        instructionsIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
        },
        instructionsTitle: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
        },
        instructionsBody: {
            marginTop: 4,
        },
        emailText: {
            fontSize: 14,
            color: colors.textLight,
            marginBottom: 12,
        },
        emailHighlight: {
            color: colors.primary,
            fontWeight: '600',
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
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.primary,
            marginTop: 6,
        },
        bulletText: {
            fontSize: 13,
            color: colors.textLight,
            flex: 1,
            lineHeight: 20,
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
                    <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.instructionsTitle}>
                    {i18n.t('inbox.add_via_email', { defaultValue: 'Add Content via Email' })}
                </ThemedText>
            </View>

            <View style={styles.instructionsBody}>
                <ThemedText style={styles.emailText}>
                    {i18n.t('inbox.email_instruction', { defaultValue: 'For content sent from your registered email' })} (
                    <ThemedText style={styles.emailHighlight}>{userEmail}</ThemedText>
                    ) {i18n.t('inbox.to', { defaultValue: 'to' })}{' '}
                    <ThemedText style={styles.emailHighlight}>inbox@klipphq.com</ThemedText>:
                </ThemedText>

                <View style={styles.bulletList}>
                    <View style={styles.bulletItem}>
                        <View style={styles.bulletDot} />
                        <ThemedText style={styles.bulletText}>
                            <ThemedText style={styles.boldText}>Default:</ThemedText>{' '}
                            {i18n.t('inbox.default_behavior', { defaultValue: 'Attachments of the same type (e.g., 3 images) are merged into a single document.' })}
                        </ThemedText>
                    </View>

                    <View style={styles.bulletItem}>
                        <View style={styles.bulletDot} />
                        <ThemedText style={styles.bulletText}>
                            <ThemedText style={styles.boldText}>Split:</ThemedText>{' '}
                            {i18n.t('inbox.split_behavior', { defaultValue: 'Add' })}{' '}
                            <ThemedText style={styles.codeText}>#split</ThemedText>{' '}
                            {i18n.t('inbox.split_behavior_end', { defaultValue: 'to the subject line to save attachments as separate documents.' })}
                        </ThemedText>
                    </View>

                    <View style={styles.bulletItem}>
                        <View style={styles.bulletDot} />
                        <ThemedText style={styles.bulletText}>
                            <ThemedText style={styles.boldText}>Note:</ThemedText>{' '}
                            {i18n.t('inbox.mixed_files', { defaultValue: 'Mixed file types (PDF+JPG) are always processed separately.' })}
                        </ThemedText>
                    </View>
                </View>
            </View>
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
                    ListHeaderComponent={
                        <>
                            {renderInstructions()}
                            <View style={styles.sectionHeader}>
                                <View>
                                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                                        {i18n.t('inbox.title', { defaultValue: 'Inbox' })}
                                    </ThemedText>
                                    <ThemedText style={styles.sectionSubtitle}>
                                        {i18n.t('inbox.subtitle', { defaultValue: 'Inbox Attachments' })}
                                    </ThemedText>
                                </View>
                            </View>
                        </>
                    }
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
