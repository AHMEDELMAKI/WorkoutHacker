import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { analyticsApi, AnalyticsSummary } from '../../../services/api/analytics.api';
import { ActivityIndicator, Alert } from 'react-native';
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProgressStackParamList } from '../../../navigation/types';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import PRList from '../components/PRList';
import { PT } from '../components/ProgressTheme';
import WeeklyVolumeChart from '../components/WeeklyVolumeChart';
import {
    MONTHLY_TREND,
    PERSONAL_RECORDS,
    WEEKLY_BARS,
} from '../data/progressData';

type Props = NativeStackScreenProps<ProgressStackParamList, 'ProgressHome'>;

// ──────────────────────────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
    icon: any; // Relaxed type for icon compatibility
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
const TOTAL_DAYS = 28;
const ACTIVE_DAYS = 21;
// Mock day activity – first 21 have a non-uniform but realistic pattern
const DAY_ACTIVE: boolean[] = Array.from({ length: TOTAL_DAYS }, (_, i) =>
    [0, 2, 3, 5, 7, 8, 9, 11, 12, 14, 15, 16, 18, 19, 20, 21, 23, 24, 25, 26, 27].includes(i),
);

const ConsistencyTracker: React.FC = () => (
    <View style={ctStyles.card}>
        <View style={ctStyles.header}>
            <Text style={ctStyles.title}>Consistency</Text>
            <Text style={ctStyles.subtitle}>{ACTIVE_DAYS} of {TOTAL_DAYS} days active</Text>
        </View>
        <View style={ctStyles.grid}>
            {DAY_ACTIVE.map((active, i) => (
                <View
                    key={i}
                    style={[ctStyles.cell, active ? ctStyles.cellActive : ctStyles.cellInactive]}
                />
            ))}
        </View>
    </View>
);

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
    title: {
        fontSize: PT.font.label,
        fontWeight: '700',
        color: PT.textPrimary,
    },
    subtitle: {
        fontSize: PT.font.micro,
        color: PT.accent,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    cell: {
        width: 16,
        height: 16,
        borderRadius: 4,
    },
    cellActive: { backgroundColor: PT.accent },
    cellInactive: { backgroundColor: '#EDE8F3' },
});

// ──────────────────────────────────────────────────────────────────
// WORKOUT HISTORY
// ──────────────────────────────────────────────────────────────────
const WORKOUTS = [
    {
        id: '1',
        name: 'Full Body',
        duration: '48 min',
        score: 92,
        calories: 420,
        icon: 'barbell-outline' as const,
        workoutType: 'full_body' as const,
        muscleFocus: ['Chest', 'Back', 'Legs', 'Shoulders'],
        suggestions: ['Slow down on deadlifts for better form.', 'Add 5 kg to bench press next session.'],
    },
    {
        id: '2',
        name: 'Upper Body',
        duration: '35 min',
        score: 85,
        calories: 290,
        icon: 'fitness-outline' as const,
        workoutType: 'upper_body' as const,
        muscleFocus: ['Chest', 'Shoulders', 'Triceps', 'Biceps'],
        suggestions: ['Focus on slow negatives for triceps.', 'Increase shoulder volume by 10%.'],
    },
    {
        id: '3',
        name: 'Lower Body',
        duration: '40 min',
        score: 88,
        calories: 380,
        icon: 'bicycle-outline' as const,
        workoutType: 'lower_body' as const,
        muscleFocus: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
        suggestions: ['Add Bulgarian split squats next week.', 'Great squat depth today!'],
    },
];

const WorkoutHistory: React.FC<{ navigation: Props['navigation'] }> = ({ navigation }) => (
    <View style={whStyles.card}>
        <View style={whStyles.header}>
            <Text style={whStyles.title}>Recent Workouts</Text>
            <TouchableOpacity accessibilityRole="button">
                <Text style={whStyles.seeAll}>See all</Text>
            </TouchableOpacity>
        </View>
        {WORKOUTS.map((w, index) => (
            <React.Fragment key={w.id}>
                <TouchableOpacity
                    style={whStyles.row}
                    activeOpacity={0.7}
                    accessibilityLabel={`${w.name} ${w.duration}`}
                    onPress={() => navigation.navigate('WorkoutSummary', {
                        workoutType: w.workoutType,
                        score: w.score,
                        duration: w.duration,
                        calories: w.calories,
                        muscleFocus: w.muscleFocus,
                        suggestions: w.suggestions,
                    })}
                >
                    <View style={whStyles.iconWrap}>
                        <Ionicons name={w.icon} size={20} color={PT.accent} />
                    </View>
                    <View style={whStyles.info}>
                        <Text style={whStyles.wName}>{w.name}</Text>
                        <Text style={whStyles.wDur}>{w.duration}</Text>
                    </View>
                    <View style={whStyles.scoreBadge}>
                        <Text style={whStyles.score}>{w.score}</Text>
                    </View>
                </TouchableOpacity>
                {index < WORKOUTS.length - 1 && <View style={whStyles.sep} />}
            </React.Fragment>
        ))}
    </View>
);

const whStyles = StyleSheet.create({
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
        marginBottom: PT.spacing.sm,
    },
    title: {
        fontSize: PT.font.label,
        fontWeight: '700',
        color: PT.textPrimary,
    },
    seeAll: {
        fontSize: PT.font.micro,
        color: PT.accent,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        columnGap: 12,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: PT.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: { flex: 1 },
    wName: {
        fontSize: PT.font.label,
        fontWeight: '700',
        color: PT.textPrimary,
    },
    wDur: {
        fontSize: PT.font.micro,
        color: PT.textMuted,
        marginTop: 2,
        fontWeight: '500',
    },
    scoreBadge: {
        backgroundColor: PT.accentDim,
        borderRadius: PT.radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    score: {
        fontSize: PT.font.label,
        fontWeight: '800',
        color: PT.accent,
    },
    sep: {
        height: 1,
        backgroundColor: '#F0EBF7',
        marginLeft: 54,
    },
});

// ──────────────────────────────────────────────────────────────────
// ACHIEVEMENT BANNER
// ──────────────────────────────────────────────────────────────────
const AchievementBanner: React.FC = () => (
    <View style={abStyles.card}>
        <View style={abStyles.iconWrap}>
            <Ionicons name="trophy" size={26} color="#FFD700" />
        </View>
        <View style={abStyles.text}>
            <Text style={abStyles.title}>3-Week Streak! 🔥</Text>
            <Text style={abStyles.sub}>You've worked out 21 days in a row. Amazing!y</Text>
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
        shadowOpacity: 0.40,
        shadowRadius: 14,
        elevation: 8,
    },
    iconWrap: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: { flex: 1 },
    title: {
        fontSize: PT.font.label,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    sub: {
        fontSize: PT.font.micro,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 16,
    },
});

// ──────────────────────────────────────────────────────────────────
// PROGRESS SCREEN
// ──────────────────────────────────────────────────────────────────
const ProgressScreen: React.FC<Props> = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchData();
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const summary = await analyticsApi.getSummary();
            setData(summary);
        } catch (err: any) {
            Alert.alert('Analysis Failed', 'Could not load your progress data.');
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

    if (!data) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor={PT.bgPrimary} />
                <SafeAreaView style={styles.safe} edges={['top']}>
                    <View style={[styles.emptyState, { backgroundColor: PT.bgPrimary }]}> 
                        <Ionicons name="warning-outline" size={22} color={PT.accent} />
                        <Text style={styles.emptyTitle}>No progress data</Text>
                        <Text style={styles.emptySub}>We couldn’t load your analytics summary.</Text>
                        <TouchableOpacity
                            style={styles.retryBtn}
                            accessibilityRole="button"
                            onPress={fetchData}
                        >
                            <Text style={styles.retryBtnText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }


    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={PT.bgPrimary} />
            <SafeAreaView style={styles.safe} edges={['top']}>
                {/* Header */}
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
                    {/* Stat row */}
                    <View style={styles.statRow}>
                        <StatCard
                            icon="barbell-outline"
                            label="Workouts"
                            value={String(data.totalWorkouts)}
                            sub="All time"
                            color={PT.accent}
                        />
                        <StatCard
                            icon="flame-outline"
                            label="Calories"
                            value={String(Math.round(data.totalCalories / 1000)) + 'k'}
                            sub="Burned"
                            color="#F59E0B"
                        />
                    </View>

                    {/* Weekly Volume */}
                    <WeeklyVolumeChart
                        bars={
                            (data.weeklyVolume?.length ?? 0) > 0
                                ? (data.weeklyVolume ?? []).map(v => ({ ...v, value: v.volume, label: v.day }))
                                : WEEKLY_BARS
                        }
                    />

                    {/* Monthly Trend */}
                    <MonthlyTrendChart
                        data={
                            (data.monthlyTrend?.length ?? 0) > 0
                                ? (data.monthlyTrend ?? []).map(t => ({
                                    month: t.month,
                                    score: t.score,
                                    week: '1',
                                    strength: t.score,
                                    endurance: t.score,
                                    recovery: t.score,
                                }))
                                : MONTHLY_TREND
                        }
                    />

                    {/* Consistency */}
                    <ConsistencyTracker />

                    {/* Workout History */}
                    {/* Transforming API data to match UI component expectation */}
                    <View style={whStyles.card}>
                        <View style={whStyles.header}>
                            <Text style={whStyles.title}>Recent Workouts</Text>
                            <TouchableOpacity accessibilityRole="button">
                                <Text style={whStyles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        {(data.recentWorkouts ?? []).length > 0 ? (
                            (data.recentWorkouts ?? []).map((w, index) => (
                                <React.Fragment key={w.id}>
                                    <TouchableOpacity
                                        style={whStyles.row}
                                        activeOpacity={0.7}
                                        onPress={() =>
                                            navigation.navigate('WorkoutSummary', {
                                                workoutType: w.workoutType as any,
                                                score: w.score,
                                                duration: w.duration,
                                                calories: w.calories,
                                                muscleFocus: [w.workoutType],
                                                suggestions: [],
                                            })
                                        }
                                    >
                                        <View style={whStyles.iconWrap}>
                                            <Ionicons name="barbell-outline" size={20} color={PT.accent} />
                                        </View>
                                        <View style={whStyles.info}>
                                            <Text style={whStyles.wName}>{w.name}</Text>
                                            <Text style={whStyles.wDur}>{w.duration}</Text>
                                        </View>
                                        <View style={whStyles.scoreBadge}>
                                            <Text style={whStyles.score}>{w.score}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {index < ((data.recentWorkouts ?? []).length - 1) && (
                                        <View style={whStyles.sep} />
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <View style={{ paddingVertical: 10 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>
                                    No recent workouts yet.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Personal Records */}
                    <PRList records={PERSONAL_RECORDS} />

                    {/* Achievement */}
                    <AchievementBanner />
                </Animated.ScrollView>
            </SafeAreaView>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = PT;

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 6,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginTop: -2,
    },
    retryBtn: {
        marginTop: 12,
        backgroundColor: PT.accent,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
    },
    retryBtnText: {
        color: '#0B0B0F',
        fontWeight: '800',
        fontSize: 14,
    },
    root: {
        flex: 1,
        backgroundColor: PT.bgPrimary,
    },
    safe: { flex: 1 },

    // Header card
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingHorizontal: S.lg,
        paddingTop: S.md,
        paddingBottom: S.lg,
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: S.md,
    },
    headerInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: PT.bgPrimary,
        letterSpacing: 0.2,
    },
    headerSub: {
        fontSize: F.micro,
        color: 'rgba(107,63,160,0.65)',
        marginTop: 3,
        fontWeight: '400',
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: PT.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
    },

    scrollContent: {
        paddingBottom: 40,
    },
    statRow: {
        flexDirection: 'row',
        marginHorizontal: S.lg,
        marginBottom: S.md,
        columnGap: 10,
    },
});

export default ProgressScreen;
