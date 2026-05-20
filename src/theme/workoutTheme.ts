// src/theme/workoutTheme.ts
// Design tokens for the soft-violet fitness UI

export const workoutTheme = {
    colors: {
        background: '#8E63B5',
        header: '#A783C7',
        card: '#F6F1FA',
        cardBorder: '#D8BFEA',
        primary: '#8C5CC4',
        primaryDark: '#6B3FA0',
        textDark: '#2D2235',
        textLight: '#FFFFFF',
        textMuted: '#9A8AA8',
        success: '#69C36D',
        warning: '#E2B93B',
        danger: '#E56B6B',
    },

    radius: {
        sm: 12,
        md: 20,
        lg: 28,
        xl: 36,
    },

    spacing: {
        xs: 6,
        sm: 10,
        md: 16,
        lg: 24,
        xl: 32,
    },

    shadow: {
        card: {
            shadowColor: '#6B3FA0',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 5,
        },
        button: {
            shadowColor: '#6B3FA0',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 14,
            elevation: 8,
        },
    },
} as const;

export type WorkoutTheme = typeof workoutTheme;
export const WT = workoutTheme;
