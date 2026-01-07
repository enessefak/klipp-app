import { ThemeColors } from '@/src/infrastructure/theme/Colors';
import { StyleSheet } from 'react-native';

export const createScanStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    captureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerSpacer: {
        width: 36,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    closeButtonText: {
        fontSize: 18,
        color: colors.text,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },

    // Capture Step Styles
    captureContainer: {
        flex: 1,
        gap: 16,
    },
    captureSubtitle: {
        textAlign: 'center',
        color: colors.textLight,
        marginBottom: 20,
    },

    // Analyzing Step Styles
    analyzingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        opacity: 0.3,
    },
    analyzingOverlay: {
        position: 'absolute',
        alignItems: 'center',
    },
    analyzingText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    analyzingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: colors.textLight,
    },

    // Form Step Styles
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 16,
    },
    formHeaderTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },
    headerCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
        marginTop: 0,
        marginBottom: 16,
    },
    error: {
        color: colors.error,
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    collapsibleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    collapsibleHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    collapsibleIcon: {
        fontSize: 20,
    },
    collapsibleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    collapsibleArrow: {
        fontSize: 12,
        color: colors.gray,
    },
    expandHint: {
        fontSize: 12,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
        fontStyle: 'italic',
    },
    customFieldsSectionStandalone: {
        marginTop: 8,
    },
    customFieldsContent: {
        marginTop: 0,
    },
    submitButton: {
        marginTop: 32,
    },
    addMethodCard: {
        marginBottom: 24,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
});
