// src/features/workout/components/PerformanceBar.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import AppText from '../../../components/AppText';
import { WT } from '../../../theme/workoutTheme';

interface PerformanceBarProps {
    label: string;
    value: number; // 0–100
    color?: string;
}

const PerformanceBar: React.FC<PerformanceBarProps> = ({
    label,
    value,
    color,
}) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: value / 100,
            duration: 700,
            delay: 150,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const barColor =
        color ??
        (value >= 85
            ? WT.colors.success
            : value >= 65
                ? WT.colors.warning
                : WT.colors.danger);

    return (
        <View style={styles.wrapper}>
            <View style={styles.labelRow}>
                <AppText variant="bodySmall" color={WT.colors.textMuted} style={styles.label}>
                    {label}
                </AppText>
                <AppText
                    variant="bodySmall"
                    color={barColor}
                    style={styles.pct}
                >
                    {value}%
                </AppText>
            </View>
            <View style={styles.track}>
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            backgroundColor: barColor,
                            width: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: WT.spacing.sm,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontWeight: '600',
    },
    pct: {
        fontWeight: '800',
        fontSize: 14,
    },
    track: {
        height: 10,
        backgroundColor: WT.colors.cardBorder,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
});

export default PerformanceBar;
