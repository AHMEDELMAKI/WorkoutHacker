// File: src/features/progress/components/MonthlyTrendChart.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { MonthlyPoint } from '../data/progressData';
import { PT } from './ProgressTheme';

const CHART_H = 120;

// ── Preserve original metric definitions ────────────────────────
const METRICS = [
    { key: 'strength' as const, label: 'Strength', color: PT.chartStrength },
    { key: 'endurance' as const, label: 'Endurance', color: PT.chartEndurance },
    { key: 'recovery' as const, label: 'Recovery', color: PT.chartRecovery },
];

interface Props { data: MonthlyPoint[] }

const MonthlyTrendChart: React.FC<Props> = ({ data }) => {
    // ── Preserve fade-in animation ──────────────────────────────
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }).start();
    }, [fadeAnim]);

    // ── Preserve original polyline calculation ──────────────────
    const W_INNER = 240;
    const xStep = data.length > 1 ? W_INNER / (data.length - 1) : W_INNER;

    const getPoints = (metric: typeof METRICS[number]['key']) =>
        data.map((d, i) => ({
            x: i * xStep,
            y: CHART_H - (d[metric] / 100) * CHART_H,
        }));

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Monthly Trends</Text>
                    <Text style={styles.subtitle}>Last 4 weeks</Text>
                </View>
                <View style={styles.legend}>
                    {METRICS.map(m => (
                        <View key={m.key} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                            <Text style={styles.legendLabel}>{m.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Chart – preserve dot+connector rendering, just restyle */}
            <Animated.View style={[styles.chartArea, { opacity: fadeAnim }]}>
                {/* X-axis week labels */}
                <View style={styles.xAxis}>
                    {data.map(d => (
                        <Text key={d.week} style={styles.xLabel}>{d.week}</Text>
                    ))}
                </View>

                {/* Dots + connecting lines (original logic unchanged) */}
                {METRICS.map(metric => {
                    const pts = getPoints(metric.key);
                    return (
                        <View key={metric.key} style={StyleSheet.absoluteFill} pointerEvents="none">
                            {pts.map((pt, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        { left: pt.x + 14, top: pt.y + 4, backgroundColor: metric.color },
                                    ]}
                                />
                            ))}
                            {pts.slice(0, -1).map((pt, i) => {
                                const next = pts[i + 1];
                                const dx = next.x - pt.x;
                                const dy = next.y - pt.y;
                                const len = Math.sqrt(dx * dx + dy * dy);
                                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                                return (
                                    <View
                                        key={`l${i}`}
                                        style={[
                                            styles.connector,
                                            {
                                                width: len,
                                                left: pt.x + 14,
                                                top: pt.y + 8,
                                                backgroundColor: metric.color,
                                                transform: [{ rotate: `${angle}deg` }],
                                                transformOrigin: '0 50%',
                                            },
                                        ]}
                                    />
                                );
                            })}
                        </View>
                    );
                })}
            </Animated.View>
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
    legend: {
        rowGap: 4,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 5,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendLabel: {
        fontSize: F.micro,
        color: PT.textSecondary,
        fontWeight: '500',
    },
    chartArea: {
        height: CHART_H + 24,
        position: 'relative',
        overflow: 'hidden',
    },
    xAxis: {
        position: 'absolute',
        bottom: 0,
        left: 14,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    xLabel: {
        flex: 1,
        fontSize: F.micro,
        color: PT.textMuted,
        textAlign: 'center',
        fontWeight: '500',
    },
    dot: {
        position: 'absolute',
        width: 9,
        height: 9,
        borderRadius: 4.5,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    connector: {
        position: 'absolute',
        height: 2,
        borderRadius: 1,
        opacity: 0.65,
    },
});

export default MonthlyTrendChart;