/**
 * Profile Setup Design System Tokens
 * Shared violet palette matching Auth flow and Figma reference.
 */

export const SetupTheme = {
    // ─── Backgrounds ──────────────────────────────────────────────
    bgPrimary: '#875BA4',
    bgDark: '#6B3FA0',

    // ─── Cards / Glass ────────────────────────────────────────────
    cardBg: 'rgba(255,255,255,0.13)',
    cardBorder: 'rgba(255,255,255,0.22)',
    cardSelected: 'rgba(255,255,255,0.26)',
    cardSelectedBorder: '#FFFFFF',

    // ─── Text ─────────────────────────────────────────────────────
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.72)',
    textMuted: 'rgba(255,255,255,0.45)',

    // ─── Buttons ──────────────────────────────────────────────────
    btnBg: '#FFFFFF',
    btnText: '#875BA4',
    btnOutlineBorder: 'rgba(255,255,255,0.55)',
    btnOutlineText: '#FFFFFF',
    btnDisabledBg: 'rgba(255,255,255,0.25)',
    btnDisabledText: 'rgba(255,255,255,0.45)',

    // ─── Progress Bar ─────────────────────────────────────────────
    progressActive: '#FFFFFF',
    progressInactive: 'rgba(255,255,255,0.25)',

    // ─── Picker ────────────────────────────────────────────────────
    pickerLine: 'rgba(255,255,255,0.50)',

    // ─── Status ───────────────────────────────────────────────────
    error: '#FF6B8A',
    success: '#4CAF50',

    // ─── Divider ──────────────────────────────────────────────────
    divider: 'rgba(255,255,255,0.18)',

    // ─── Shadows ──────────────────────────────────────────────────
    shadow: 'rgba(107,63,160,0.4)',

    // ─── Spacing Scale ────────────────────────────────────────────
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
        sm: 10,
        md: 16,
        lg: 22,
        xl: 30,
        full: 999,
    } as const,

    // ─── Typography ───────────────────────────────────────────────
    font: {
        title: 26,
        subtitle: 14,
        body: 15,
        label: 13,
        caption: 12,
        picker: 32,
        pickerDim: 20,
    } as const,

    // ─── Component Heights ────────────────────────────────────────
    buttonHeight: 54,
    inputHeight: 54,
} as const;
