// File: src/features/progress/components/WeeklyVolumeChart.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import type { WeeklyBar } from '../data/progressData';
import { PT } from './ProgressTheme';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_H = 140;
const BAR_W = 28;

interface Props {
    bars: WeeklyBar[];
    accentColor?: string;
}

const WeeklyVolumeChart: React.FC<Props> = ({ bars, accentColor = PT.accent }) => {
    // ── Preserve the existing stagger spring animation logic ──────
    const anims = useRef(bars.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.stagger(
            55,
            anims.map((a, i) =>
                Animated.spring(a, {
                    toValue: bars[i].value,
                    speed: 10,
                    bounciness: 6,
                    useNativeDriver: false,
                }),
            ),
        ).start();
    }, [anims, bars]);

    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;

    // ── Summary calculations preserved ────────────────────────────
    const totalKg = (bars.reduce((s, b) => s + b.volume, 0) / 1000).toFixed(1);
    const sessions = bars.filter(b => b.value > 0).length;

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Weekly Volume</Text>
                    <Text style={styles.subtitle}>Total kilograms lifted</Text>
                </View>
                <View style={styles.totalBadge}>
                    <Text style={styles.totalValue}>{totalKg}k</Text>
                    <Text style={styles.totalLabel}>kg</Text>
                </View>
            </View>

            {/* Bars */}
            <View style={[styles.chartArea, { height: CHART_H }]}>
                {bars.map((bar, i) => {
                    const isToday = i === todayIndex;
                    const barH = anims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, CHART_H - 20],
                    });
                    return (
                        <View key={bar.day} style={styles.barCol}>
                            <View style={[styles.barTrack, { height: CHART_H - 20 }]}>
                                <Animated.View
                                    style={[
                                        styles.barFill,
                                        {
                                            height: barH,
                                            width: BAR_W,
                                            backgroundColor: isToday ? accentColor : accentColor + '44',
                                            borderRadius: 8,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
                                {bar.day}
                            </Text>
                            {isToday && <View style={styles.todayDot} />}
                        </View>
                    );
                })}
            </View>

            {/* Footer summary */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalKg}k</Text>
                    <Text style={styles.summaryLabel}>Total kg</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{sessions}</Text>
                    <Text style={styles.summaryLabel}>Sessions</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, styles.summaryGreen]}>↑ 23%</Text>
                    <Text style={styles.summaryLabel}>vs last week</Text>
                </View>
            </View>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = PT;

const styles = StyleSheet.create({
    card: {
        backgroundColor: PT.cardBg,
        borderRadius: R.lg,
        padding: PT.cardPadding,
        marginHorizontal: S.lg,
        marginBottom: S.md,
        shadowColor: PT.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: S.lg,
    },
    title: {
        fontSize: F.label,
        fontWeight: '700',
        color: PT.textPrimary,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: F.micro,
        color: PT.textMuted,
        marginTop: 2,
    },
    totalBadge: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: PT.accentDim,
        borderRadius: R.full,
        paddingHorizontal: 12,
        paddingVertical: 4,
        columnGap: 3,
    },
    totalValue: {
        fontSize: F.label,
        fontWeight: '800',
        color: PT.accent,
    },
    totalLabel: {
        fontSize: F.micro,
        color: PT.accent,
        marginBottom: 2,
        fontWeight: '600',
    },

    // Chart
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        marginBottom: S.lg,
    },
    barCol: {
        flex: 1,
        alignItems: 'center',
    },
    barTrack: {
        justifyContent: 'flex-end',
    },
    barFill: {},
    dayLabel: {
        fontSize: F.micro,
        color: PT.textMuted,
        marginTop: 4,
        fontWeight: '500',
    },
    dayLabelActive: {
        color: PT.accent,
        fontWeight: '700',
    },
    todayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: PT.accent,
        marginTop: 2,
    },

    // Footer
    summaryRow: {
        flexDirection: 'row',
        backgroundColor: '#F8F4FC',
        borderRadius: R.md,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
        rowGap: 2,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#E8E0F0',
        marginVertical: 4,
    },
    summaryValue: {
        fontSize: F.label,
        fontWeight: '800',
        color: PT.textPrimary,
    },
    summaryLabel: {
        fontSize: F.micro,
        color: PT.textMuted,
        fontWeight: '500',
    },
    summaryGreen: {
        color: PT.success,
    },
});

export default WeeklyVolumeChart;