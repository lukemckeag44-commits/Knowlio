/**
 * Professional Theme Definition for Knowlio
 * A sophisticated, academic-focused palette with deep blues and crisp accents.
 */
export const lightTheme = {
    background: '#F8FAFC', // Slate 50 - Cleaner background
    card: '#FFFFFF',
    text: '#0F172A', // Slate 900 - More professional deep blue-black
    textSecondary: '#475569', // Slate 600
    textMuted: '#94A3B8', // Slate 400
    primary: '#0369A1', // Sky 700 - Deep, professional blue from logo
    secondary: '#0891B2', // Cyan 700 - Complementary blue-green
    success: '#059669', // Emerald 600
    accent: '#0284C7', // Sky 600
    warning: '#D97706', // Amber 600
    danger: '#DC2626', // Red 600
    border: '#E2E8F0', // Slate 200
    input: '#F1F5F9', // Slate 100
    shadow: 'rgba(15, 23, 42, 0.08)',
    radius: {
        sm: 6,
        md: 10,
        lg: 16,
        xl: 24,
    }
};

export const darkTheme = {
    background: '#020617', // Slate 950 - Deepest blue-black
    card: '#0F172A', // Slate 900
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    primary: '#38BDF8', // Sky 400
    secondary: '#22D3EE', // Cyan 400
    success: '#34D399', // Emerald 400
    accent: '#7DD3FC', // Sky 300
    warning: '#FBBF24', // Amber 400
    danger: '#F87171', // Red 400
    border: '#1E293B', // Slate 800
    input: '#1E293B', // Slate 800
    shadow: 'rgba(0, 0, 0, 0.3)',
    radius: {
        sm: 6,
        md: 10,
        lg: 16,
        xl: 24,
    }
};

export type ThemeColors = typeof lightTheme;
