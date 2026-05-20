/**
 * Auth-specific design tokens.
 * Soft violet palette matching Figma spec.
 */
export const AuthColors = {
    // Backgrounds
    bgPrimary: '#875BA4',
    bgDark: '#6B3FA0',
    bgCard: 'rgba(255,255,255,0.13)',
    bgCardSolid: '#9A6CBC',

    // Inputs
    inputBg: 'rgba(255,255,255,0.15)',
    inputBorder: 'rgba(255,255,255,0.35)',
    inputBorderFocused: '#FFFFFF',
    inputBorderError: '#FF6B8A',
    placeholder: 'rgba(255,255,255,0.55)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textMuted: 'rgba(255,255,255,0.50)',
    textLink: '#FFFFFF',

    // Buttons
    btnBg: '#FFFFFF',
    btnText: '#6B3FA0',
    btnOutlineBorder: 'rgba(255,255,255,0.60)',
    btnOutlineText: '#FFFFFF',

    // Status
    error: '#FF6B8A',
    success: '#4CAF50',

    // Misc
    divider: 'rgba(255,255,255,0.30)',
    checkboxBorder: 'rgba(255,255,255,0.50)',
    checkboxChecked: '#FFFFFF',
    shadow: 'rgba(107,63,160,0.35)',
} as const;
