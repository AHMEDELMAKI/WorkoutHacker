import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { analyticsApi, AnalyticsSummary } from '../../../services/api/analytics.api';
import { ActivityIndicator, Alert, Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProgressStackParamList } from '../../../navigation/types';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import PRList from '../components/PRList';
import { PT } from '../components/ProgressTheme';
import WeeklyVolumeChart from '../components/WeeklyVolumeChart';
import {
    MONTHLY_TREND,
    WEEKLY_BARS,
} from '../data/progressData';
import type { PersonalRecord as UI_PR } from '../data/progressData';

type Props = NativeStackScreenProps<ProgressStackParamList, 'ProgressHome'>;

// ──────────────────────────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
    icon: any;
    label: string;
    value: string;
    sub?: string;
    color?: string;
}> = ({ icon, label, value, sub, color = PT.accent }) => (
    <View style={statStyles.card}>
        <View style={[statStyles.iconCircle, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={statStyles.value}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
        {!!sub && <Text style={statStyles.sub}>{sub}</Text>}
    </View>
);

const statStyles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: PT.cardBg,
        borderRadius: PT.radius.lg,
        padding: 16,
        alignItems: 'flex-start',
        rowGap: 4,
        shadowColor: PT.cardShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    value: {
        fontSize: PT.font.bigStat,
        fontWeight: '800',
        color: PT.textPrimary,
        lineHeight: 42,
    },
    label: {
        fontSize: PT.font.label,
        fontWeight: '600',
        color: PT.textSecondary,
    },
    sub: {
        fontSize: PT.font.micro,
        color: PT.success,
        fontWeight: '600',
    },
});

// ──────────────────────────────────────────────────────────────────
// CONSISTENCY TRACKER
// ──────────────────────────────────────────────────────────────────
const ConsistencyTracker: React.FC<{ activeDays: number }> = ({ activeDays }) => {
    const dayActive = Array.from({ length: 28 }, (_, i) => i < activeDays);

    return (
        <View style={ctStyles.card}>
            <View style={ctStyles.header}>
                <Text style={ctStyles.title}>Consistency</Text>
                <Text style={ctStyles.subtitle}>{activeDays} of 28 days active</Text>
            </View>
            <View style={ctStyles.grid}>
                {dayActive.map((active, i) => (
                    <View
                        key={i}
                        style={[ctStyles.cell, active ? ctStyles.cellActive : ctStyles.cellInactive]}
                    />
                ))}
            </View>
        </View>
    );
};

const ctStyles = StyleSheet.create({
    card: {
        backgroundColor: PT.cardBg,
        borderRadius: PT.radius.lg,
        padding: PT.cardPadding,
        marginHorizontal: PT.spacing.lg,
        marginBottom: PT.spacing.md,
        shadowColor: PT.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: PT.spacing.md,
    },
    title: { fontSize: PT.font.label, fontWeight: '700', color: PT.textPrimary },
    subtitle: { fontSize: PT.font.micro, color: PT.accent, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    cell: { width: 16, height: 16, borderRadius: 4 },
    cellActive: { backgroundColor: PT.accent },
    cellInactive: { backgroundColor: PT.bgPrimary + '15' },
});

// ──────────────────────────────────────────────────────────────────
// ACHIEVEMENT BANNER
// ──────────────────────────────────────────────────────────────────
const AchievementBanner: React.FC<{ currentStreak: number }> = ({ currentStreak }) => (
    <View style={abStyles.card}>
        <View style={abStyles.iconWrap}>
            <Ionicons name="trophy" size={26} color="#FFD700" />
        </View>
        <View style={abStyles.text}>
            <Text style={abStyles.title}>{currentStreak}-Day Streak! 🔥</Text>
            <Text style={abStyles.sub}>You've worked out {currentStreak} days in a row. Keep it up!</Text>
        </View>
    </View>
);

const abStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PT.bgDark,
        borderRadius: PT.radius.lg,
        padding: PT.cardPadding,
        marginHorizontal: PT.spacing.lg,
        marginBottom: PT.spacing.md,
        columnGap: 14,
        shadowColor: PT.bgDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.40, shadowRadius: 14, elevation: 8,
    },
    iconWrap: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    text: { flex: 1 },
    title: { fontSize: PT.font.label, fontWeight: '800', color: PT.cardBg, marginBottom: 3 },
    sub: { fontSize: PT.font.micro, color: 'rgba(255,255,255,0.75)', lineHeight: 16 },
});

// ──────────────────────────────────────────────────────────────────
// PROGRESS SCREEN
// ──────────────────────────────────────────────────────────────────
const ProgressScreen: React.FC<Props> = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [weekly, setWeekly] = useState<any>(null);
    const [prs, setPrs] = useState<UI_PR[]>([]);
    const [streaks, setStreaks] = useState({ currentStreak: 0, longestStreak: 0 });
    const [formTrend, setFormTrend] = useState<any[]>([]);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchData();
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sum, week, strk, records, trend] = await Promise.all([
                analyticsApi.getSummary().catch(() => null),
                analyticsApi.getWeekly().catch(() => null),
                analyticsApi.getStreaks().catch(() => null),
                analyticsApi.getPersonalRecords().catch(() => []),
                analyticsApi.getFormTrend().catch(() => []),
            ]);

            if (sum) setSummary(sum);
            if (week) setWeekly(week);
            if (strk) setStreaks(strk);
            setFormTrend(trend || []);

            const colors = ['#7C3AED', '#0EA5E9', '#F59E0B', '#10B981'];
            const icons = ['🏋️', '🏃', '⚡', '💪'];
            
            const validRecords = Array.isArray(records) ? records : [];
            const uiPrs: UI_PR[] = validRecords.map((r, i) => ({
                id: `pr-${i}`,
                exercise: r.exerciseName,
                value: `${r.totalReps} Reps`,
                date: r.workoutSession?.startedAt ? new Date(r.workoutSession.startedAt).toLocaleDateString() : 'N/A',
                icon: icons[i % icons.length],
                color: colors[i % colors.length],
            }));
            setPrs(uiPrs);

        } catch (err: any) {
            console.error('[ProgressScreen] Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={PT.accent} />
            </View>
        );
    }

    const weeklyBars = weekly ? Object.entries(weekly.byDay).map(([day, stats]: [string, any]) => ({
        day,
        value: stats.minutes > 0 ? Math.min(stats.minutes / 60, 1) : 0,
        volume: stats.calories,
    })) : WEEKLY_BARS;

    const monthlyTrendData = formTrend.length > 0 ? formTrend.slice(-4).map((t, i) => ({
        week: `W${i + 1}`,
        strength: t.formScore,
        endurance: t.formScore * 0.9,
        recovery: t.formScore * 0.8,
    })) : MONTHLY_TREND;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={PT.bgPrimary} />
            <SafeAreaView style={styles.safe} edges={['top']}>
                <View style={styles.headerCard}>
                    <View style={styles.headerInner}>
                        <View>
                            <Text style={styles.headerTitle}>Your Progress</Text>
                            <Text style={styles.headerSub}>Keep pushing, you're doing great</Text>
                        </View>
                        <View style={styles.headerIcon}>
                            <Ionicons name="stats-chart" size={22} color={PT.bgPrimary} />
                        </View>
                    </View>
                </View>

                <Animated.ScrollView
                    style={{ opacity: fadeAnim }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.statRow}>
                        <StatCard
                            icon="barbell-outline"
                            label="Workouts"
                            value={String(summary?.totalWorkouts ?? 0)}
                            sub="All time"
                            color={PT.accent}
                        />
                        <StatCard
                            icon="flame-outline"
                            label="Calories"
                            value={summary?.totalCaloriesBurned ? `${(summary.totalCaloriesBurned / 1000).toFixed(1)}k` : '0'}
                            sub="Burned"
                            color={PT.warning}
                        />
                    </View>

                    <WeeklyVolumeChart bars={weeklyBars} />
                    <MonthlyTrendChart data={monthlyTrendData as any} />
                    <ConsistencyTracker activeDays={weekly?.sessions?.length ?? 0} />
                    <PRList records={prs} />
                    <AchievementBanner currentStreak={streaks.currentStreak} />
                </Animated.ScrollView>
            </SafeAreaView>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = PT;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: PT.bgPrimary },
    safe: { flex: 1 },
    headerCard: {
        backgroundColor: PT.cardBg, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.lg,
        shadowColor: 'rgba(0,0,0,0.15)', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1, shadowRadius: 12, elevation: 8, marginBottom: S.md,
    },
    headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: PT.bgPrimary, letterSpacing: 0.2 },
    headerSub: { fontSize: F.micro, color: 'rgba(107,63,160,0.65)', marginTop: 3, fontWeight: '400' },
    headerIcon: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: PT.accentDim, alignItems: 'center', justifyContent: 'center',
    },
    scrollContent: { paddingBottom: 40 },
    statRow: { flexDirection: 'row', marginHorizontal: S.lg, marginBottom: S.md, columnGap: 10 },
});

export default ProgressScreen;
