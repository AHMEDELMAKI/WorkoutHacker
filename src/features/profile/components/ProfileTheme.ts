/**
 * Profile Module Design System Tokens
 * Matches the violet aesthetic across the whole app.
 */

export const PPT = {
    // ─── Backgrounds ──────────────────────────────────────────────
    bgPrimary: '#875BA4',
    bgDark: '#6B3FA0',
    bgLight: '#F4EEF8',

    // ─── Cards ────────────────────────────────────────────────────
    cardBg: '#FFFFFF',
    cardShadow: 'rgba(107,63,160,0.18)',
    cardBorder: '#E8DFF1',

    // ─── Semantic ─────────────────────────────────────────────────
    accent: '#875BA4',
    accentDim: 'rgba(135,91,164,0.14)',
    success: '#7ED957',
    danger: '#FF5A5A',
    dangerDim: 'rgba(255,90,90,0.12)',

    // ─── Text ─────────────────────────────────────────────────────
    textPrimary: '#1E1E1E',
    textSecondary: '#7B7285',
    textWhite: '#FFFFFF',
    textWhiteSoft: 'rgba(255,255,255,0.75)',

    // ─── Spacing ──────────────────────────────────────────────────
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    } as const,

    // ─── Radii ────────────────────────────────────────────────────
    radius: {
        sm: 8,
        md: 14,
        lg: 20,
        xl: 24,
        xxl: 32,
        full: 999,
    } as const,

    // ─── Typography ───────────────────────────────────────────────
    font: {
        heading: 20,
        subtitle: 15,
        body: 14,
        label: 13,
        caption: 12,
        micro: 11,
    } as const,

    // ─── Component Sizes ──────────────────────────────────────────
    buttonHeight: 52,
    cardPadding: 20,
    headerHeight: 140,
} as const;
