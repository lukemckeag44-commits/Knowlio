import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from './theme';

export const createGlobalStyles = (theme: ThemeColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: theme.textSecondary,
        lineHeight: 24,
    },
    card: {
        backgroundColor: theme.card,
        borderRadius: theme.radius.lg,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
        ...Platform.select({
            ios: { shadowColor: theme.shadow, shadowOpacity: 1, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
            android: { elevation: 4 },
            web: { shadowColor: theme.shadow, shadowOpacity: 1, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } }
        }),
    },
    input: {
        backgroundColor: theme.input,
        borderRadius: theme.radius.md,
        padding: 16,
        fontSize: 16,
        color: theme.text,
        borderWidth: 1,
        borderColor: theme.border,
    },
    button: {
        backgroundColor: theme.primary,
        borderRadius: theme.radius.md,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.text,
        marginBottom: 16,
        marginTop: 24,
    }
});
