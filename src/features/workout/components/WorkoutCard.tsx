// src/features/workout/components/WorkoutCard.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import AppText from '../../../components/AppText';
import { WT } from '../../../theme/workoutTheme';

interface WorkoutCardProps {
    title?: string;
    subtitle?: string;
    style?: ViewStyle;
    children?: React.ReactNode;
    rightAction?: React.ReactNode;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
    title,
    subtitle,
    style,
    children,
    rightAction,
}) => {
    return (
        <View style={[styles.card, style]}>
            {(title || rightAction) ? (
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        {title ? (
                            <AppText variant="h3" color={WT.colors.textDark} style={styles.title}>
                                {title}
                            </AppText>
                        ) : null}
                        {subtitle ? (
                            <AppText variant="bodySmall" color={WT.colors.textMuted} style={styles.subtitle}>
                                {subtitle}
                            </AppText>
                        ) : null}
                    </View>
                    {rightAction ? <View>{rightAction}</View> : null}
                </View>
            ) : null}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        padding: WT.spacing.lg,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: WT.spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: WT.spacing.sm,
    },
    headerText: {
        flex: 1,
        marginRight: WT.spacing.sm,
    },
    title: {
        fontWeight: '700',
    },
    subtitle: {
        marginTop: 2,
    },
});

export default WorkoutCard;
