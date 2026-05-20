/**
 * AI Coach Module Design System Tokens
 * Consistent with the app's violet aesthetic.
 */

export const ACT = {
    // ─── Backgrounds ──────────────────────────────────────────────
    bgPrimary: '#875BA4',
    bgDark: '#6B3FA0',

    // ─── Cards ────────────────────────────────────────────────────
    cardBg: '#FFFFFF',
    cardSoft: 'rgba(255,255,255,0.15)',
    cardBorder: 'rgba(255,255,255,0.22)',
    cardShadow: 'rgba(107,63,160,0.20)',

    // ─── Semantic ─────────────────────────────────────────────────
    accent: '#875BA4',
    accentDim: 'rgba(135,91,164,0.14)',
    accentLight: 'rgba(135,91,164,0.40)',
    success: '#4CAF50',
    successDim: 'rgba(76,175,80,0.12)',
    warning: '#FF9800',
    warningDim: 'rgba(255,152,0,0.12)',
    danger: '#F44336',
    dangerDim: 'rgba(244,67,54,0.12)',

    // ─── Text ─────────────────────────────────────────────────────
    textPrimary: '#1F1F1F',
    textSecondary: '#666666',
    textMuted: '#AAAAAA',
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
        xl: 28,
        full: 999,
    } as const,

    // ─── Typography ───────────────────────────────────────────────
    font: {
        heading: 20,
        subtitle: 14,
        body: 15,
        label: 13,
        caption: 12,
        micro: 11,
    } as const,

    // ─── Shared sizes ─────────────────────────────────────────────
    buttonHeight: 54,
    cardPadding: 20,
} as const;
