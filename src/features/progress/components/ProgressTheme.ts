/**
 * Progress Module Design System Tokens
 * Premium fitness analytics aesthetic – white cards on violet background.
 */

export const PT = {
    // ─── Backgrounds ──────────────────────────────────────────────
    bgPrimary: '#875BA4',
    bgDark: '#6B3FA0',

    // ─── Cards ────────────────────────────────────────────────────
    /** White-ish card on violet background */
    cardBg: '#FFFFFF',
    /** Soft glass card on violet background */
    cardSoft: 'rgba(255,255,255,0.14)',
    cardBorder: 'rgba(255,255,255,0.22)',
    cardShadow: 'rgba(107,63,160,0.22)',

    // ─── Text ─────────────────────────────────────────────────────
    textPrimary: '#1F1F1F',
    textSecondary: '#777777',
    textMuted: '#AAAAAA',
    textWhite: '#FFFFFF',
    textWhiteSoft: 'rgba(255,255,255,0.75)',

    // ─── Accent ───────────────────────────────────────────────────
    accent: '#875BA4',
    accentDim: 'rgba(135,91,164,0.18)',
    success: '#4CAF50',
    successDim: 'rgba(76,175,80,0.15)',
    warning: '#FF9800',
    danger: '#F44336',

    // ─── Chart Colors ─────────────────────────────────────────────
    chartStrength: '#7C3AED',
    chartEndurance: '#0EA5E9',
    chartRecovery: '#10B981',

    // ─── Spacing ──────────────────────────────────────────────────
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    } as const,

    // ─── Border Radii ─────────────────────────────────────────────
    radius: {
        sm: 8,
        md: 14,
        lg: 20,
        xl: 28,
        full: 999,
    } as const,

    // ─── Typography ───────────────────────────────────────────────
    font: {
        heading: 22,
        subtitle: 14,
        body: 15,
        label: 13,
        caption: 12,
        micro: 11,
        bigStat: 36,
    } as const,

    // ─── Component Sizes ──────────────────────────────────────────
    buttonHeight: 54,
    cardPadding: 20,
} as const;
