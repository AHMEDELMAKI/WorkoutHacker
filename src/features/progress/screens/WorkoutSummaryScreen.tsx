import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProgressStackParamList } from '../../../navigation/types';
import { PT } from '../components/ProgressTheme';

type Props = NativeStackScreenProps<ProgressStackParamList, 'WorkoutSummary'>;

// ── Performance Bar ───────────────────────────────────────────────
const PerformanceBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: value / 100,
            duration: 600,
            delay: 200,
            useNativeDriver: false,
        }).start();
    }, []);

    const color = value >= 85 ? PT.success : value >= 70 ? PT.accent : PT.warning;

    return (
        <View style={pbStyles.row}>
            <View style={pbStyles.labelRow}>
                <Text style={pbStyles.label}>{label}</Text>
                <Text style={[pbStyles.pct, { color }]}>{value}%</Text>
            </View>
            <View style={pbStyles.track}>
                <Animated.View
                    style={[
                        pbStyles.fill,
                        {
                            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                            backgroundColor: color,
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const pbStyles = StyleSheet.create({
    row: { marginBottom: 14 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    label: { fontSize: 14, color: PT.textSecondary, fontWeight: '600' },
    pct: { fontSize: 15, fontWeight: '800' },
    track: { height: 10, backgroundColor: '#EDE8F3', borderRadius: 999, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 999 },
});

// ── Workout Summary Screen ────────────────────────────────────────
const WorkoutSummaryScreen: React.FC<Props> = ({ route, navigation }) => {
    const { workoutType, score, duration, calories, muscleFocus, suggestions } = route.params;

    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();
    }, []);

    const typeLabel: Record<string, string> = {
        full_body: 'Full Body',
        upper_body: 'Upper Body',
        lower_body: 'Lower Body',
    };

    const summaryRows = [
        { icon: 'time-outline' as const, label: 'Duration', value: duration },
        { icon: 'layers-outline' as const, label: 'Score', value: `${score} / 100` },
        { icon: 'flame-outline' as const, label: 'Calories Burned', value: `${calories} kcal` },
        { icon: 'body-outline' as const, label: 'Muscle Focus', value: muscleFocus.join(', ') },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={PT.bgPrimary} />
            <SafeAreaView edges={['top']} style={styles.safe}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Celebration hero */}
                    <Animated.View
                        style={[
                            styles.heroWrap,
                            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                        ]}
                    >
                        <View style={styles.heroCircle}>
                            <Ionicons name="checkmark-circle" size={56} color="#FFFFFF" />
                        </View>
                        <Text style={styles.heroTitle}>Workout Complete!</Text>
                        <Text style={styles.heroSub}>
                            Great job! You finished your {typeLabel[workoutType] ?? workoutType} workout.
                        </Text>
                    </Animated.View>

                    {/* Session Summary */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                        <Text style={styles.cardTitle}>Session Summary</Text>
                        {summaryRows.map((row, i) => (
                            <React.Fragment key={row.label}>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryIcon}>
                                        <Ionicons name={row.icon} size={18} color={PT.accent} />
                                    </View>
                                    <View style={styles.summaryLabelWrap}>
                                        <Text style={styles.summaryLabel}>{row.label}</Text>
                                    </View>
                                    <View style={styles.summaryValueWrap}>
                                        <Text style={styles.summaryValue}>{row.value}</Text>
                                    </View>
                                </View>
                                {i < summaryRows.length - 1 && <View style={styles.rowDivider} />}
                            </React.Fragment>
                        ))}
                    </Animated.View>

                    {/* Performance */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                        <View style={styles.cardHeaderRow}>
                            <Text style={styles.cardTitle}>Your Performance</Text>
                            <View style={styles.scoreBadge}>
                                <Text style={styles.scoreText}>{score}%</Text>
                            </View>
                        </View>
                        {muscleFocus.map(m => (
                            <PerformanceBar key={m} label={m} value={Math.floor(Math.random() * 30) + 65} />
                        ))}
                    </Animated.View>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <Animated.View style={[styles.sugCard, { opacity: fadeAnim }]}>
                            <View style={styles.sugHeader}>
                                <Ionicons name="flash" size={18} color={PT.accent} />
                                <Text style={styles.sugTitle}>Coach Says</Text>
                            </View>
                            {suggestions.map((s, i) => (
                                <View key={i} style={styles.sugRow}>
                                    <View style={styles.sugBullet} />
                                    <Text style={styles.sugText}>{s}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    )}
                </ScrollView>

                {/* Sticky back button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Back to Progress"
                    >
                        <Text style={styles.backBtnText}>Back to Progress</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = PT;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: PT.bgPrimary },
    safe: { flex: 1 },
    scrollContent: { paddingBottom: 32, paddingTop: S.lg },

    // ── Hero ──────────────────────────────────────────────────────
    heroWrap: {
        alignItems: 'center',
        paddingHorizontal: S.lg,
        paddingBottom: S.lg,
    },
    heroCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: 'rgba(255,255,255,0.20)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.40)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
        textAlign: 'center',
    },
    heroSub: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.82)',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },

    // ── Cards ─────────────────────────────────────────────────────
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: R.lg,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginHorizontal: S.lg,
        marginBottom: 12,
        shadowColor: PT.cardShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: PT.textPrimary,
        marginBottom: S.sm,
        letterSpacing: 0.2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: S.sm,
    },
    scoreBadge: {
        backgroundColor: 'rgba(76,175,80,0.12)',
        borderRadius: R.full,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    scoreText: { fontSize: 14, fontWeight: '800', color: PT.success },

    // ── Summary rows ──────────────────────────────────────────────
    summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, columnGap: 12 },
    summaryIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: PT.accentDim, alignItems: 'center', justifyContent: 'center',
    },
    summaryLabelWrap: {
        flexShrink: 0,
        width: 110,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#777',
        fontWeight: '500',
    },
    summaryValueWrap: {
        flex: 1,
        alignItems: 'flex-end',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '800',
        color: PT.textPrimary,
        textAlign: 'right',
    },
    rowDivider: { height: 1, backgroundColor: '#F0EBF7', marginLeft: 48 },

    // ── Suggestions ───────────────────────────────────────────────
    sugCard: {
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderRadius: R.lg,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginHorizontal: S.lg,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
    },
    sugHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 6,
        marginBottom: 12,
    },
    sugTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    sugRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 10,
        paddingVertical: 6,
    },
    sugBullet: {
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.70)',
        marginTop: 8,
        flexShrink: 0,
    },
    sugText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 23,
    },

    // ── Footer button (inline, not absolute) ──────────────────────
    footer: {
        paddingHorizontal: S.lg,
        paddingTop: 4,
        paddingBottom: S.lg,
    },
    backBtn: {
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: R.xl,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PT.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 10,
        elevation: 6,
    },
    backBtnText: { fontSize: 16, fontWeight: '800', color: PT.accent },
});

export default WorkoutSummaryScreen;
