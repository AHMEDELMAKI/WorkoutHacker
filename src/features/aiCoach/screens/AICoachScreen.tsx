import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACT } from '../components/AICoachTheme';
import { subscribeVoiceAction } from '../../../services/voiceActionBus';

// ──────────────────────────────────────────────────────────────────
// DATA / TYPES  (all AI recommendation data lives here – easy to swap
//               with a real API / service without changing the UI layer)
// ──────────────────────────────────────────────────────────────────

interface ExerciseSuggestion {
    id: string;
    name: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    tag: string;
}

interface WeightSuggestion {
    id: string;
    exercise: string;
    delta: string;   // e.g. '+2.5 kg', 'Maintain', '-5 kg'
    type: 'increase' | 'maintain' | 'decrease';
    reason: string;
}

interface RecoveryAdvice {
    id: string;
    text: string;
}

const EXERCISE_SUGGESTIONS: ExerciseSuggestion[] = [
    {
        id: 'ex1',
        name: 'Pike Push-ups',
        description: 'Your shoulders need more attention this week.',
        icon: 'body-outline',
        tag: 'Strength',
    },
    {
        id: 'ex2',
        name: 'Romanian Deadlifts',
        description: 'Strengthen your hamstrings to balance your lower body.',
        icon: 'barbell-outline',
        tag: 'Hypertrophy',
    },
    {
        id: 'ex3',
        name: 'Face Pulls',
        description: 'Improve rear-delt activation and posture.',
        icon: 'fitness-outline',
        tag: 'Corrective',
    },
];

const WEIGHT_SUGGESTIONS: WeightSuggestion[] = [
    {
        id: 'w1',
        exercise: 'Bench Press',
        delta: '+2.5 kg',
        type: 'increase',
        reason: 'You hit all reps with ease last session.',
    },
    {
        id: 'w2',
        exercise: 'Squats',
        delta: 'Maintain',
        type: 'maintain',
        reason: 'Current weight is optimal for form.',
    },
    {
        id: 'w3',
        exercise: 'Deadlifts',
        delta: '-5 kg',
        type: 'decrease',
        reason: 'Form issue detected — focus on technique first.',
    },
    {
        id: 'w4',
        exercise: 'Pull-ups',
        delta: '+2 reps',
        type: 'increase',
        reason: 'Progressive overload via volume increase.',
    },
];

const RECOVERY_ADVICE: RecoveryAdvice[] = [
    { id: 'r1', text: 'Sleep 7–9 hours for optimal muscle repair.' },
    { id: 'r2', text: 'Focus on hydration — aim for 3 L of water today.' },
    { id: 'r3', text: 'Light stretching or yoga on rest days reduces soreness.' },
    { id: 'r4', text: 'Cold shower post-workout speeds recovery.' },
];

// ──────────────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ──────────────────────────────────────────────────────────────────

// ── CoachCard ──────────────────────────────────────────────────
const CoachCard: React.FC<{
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    children: React.ReactNode;
    rightContent?: React.ReactNode;
}> = ({ title, icon, children, rightContent }) => (
    <View style={ccStyles.card}>
        <View style={ccStyles.header}>
            <View style={ccStyles.titleRow}>
                <View style={ccStyles.iconWrap}>
                    <Ionicons name={icon} size={18} color={ACT.accent} />
                </View>
                <Text style={ccStyles.title}>{title}</Text>
            </View>
            {rightContent}
        </View>
        {children}
    </View>
);

const ccStyles = StyleSheet.create({
    card: {
        backgroundColor: ACT.cardBg,
        borderRadius: ACT.radius.lg,
        padding: ACT.cardPadding,
        marginHorizontal: ACT.spacing.lg,
        marginBottom: ACT.spacing.md,
        shadowColor: ACT.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: ACT.spacing.sm + 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: ACT.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: ACT.font.label,
        fontWeight: '700',
        color: ACT.textPrimary,
        letterSpacing: 0.2,
    },
});

// ── SuggestionPill ──────────────────────────────────────────────
const SuggestionPillPressable: React.FC<{
    suggestion: ExerciseSuggestion;
    onPress: () => void;
}> = ({ suggestion, onPress }) => (
    <TouchableOpacity
        style={spStyles.pill}
        activeOpacity={0.75}
        accessibilityLabel={suggestion.name}
        accessibilityRole="button"
        onPress={onPress}
    >
        <View style={spStyles.left}>
            <View style={spStyles.iconCircle}>
                <Ionicons name={suggestion.icon} size={20} color={ACT.accent} />
            </View>
            <View style={spStyles.text}>
                <View style={spStyles.nameRow}>
                    <Text style={spStyles.name}>{suggestion.name}</Text>
                    <View style={spStyles.tag}>
                        <Text style={spStyles.tagText}>{suggestion.tag}</Text>
                    </View>
                </View>
                <Text style={spStyles.desc} numberOfLines={2}>{suggestion.description}</Text>
            </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={ACT.textMuted} />
    </TouchableOpacity>
);

const spStyles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: ACT.accentDim,
        borderRadius: ACT.radius.md,
        padding: 12,
        marginBottom: 8,
    },
    left: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 10,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: ACT.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    text: { flex: 1, rowGap: 3 },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
        flexWrap: 'wrap',
    },
    name: {
        fontSize: ACT.font.label,
        fontWeight: '700',
        color: ACT.textPrimary,
    },
    tag: {
        backgroundColor: ACT.accent + '22',
        borderRadius: ACT.radius.full,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    tagText: {
        fontSize: ACT.font.micro,
        color: ACT.accent,
        fontWeight: '700',
    },
    desc: {
        fontSize: ACT.font.caption,
        color: ACT.textSecondary,
        lineHeight: 17,
    },
});

// ── RecommendationRow ───────────────────────────────────────────
const DELTA_COLORS: Record<WeightSuggestion['type'], string> = {
    increase: ACT.accent,
    maintain: ACT.success,
    decrease: ACT.danger,
};

const RecommendationRow: React.FC<{ item: WeightSuggestion; isLast: boolean }> = ({
    item,
    isLast,
}) => {
    const color = DELTA_COLORS[item.type];
    return (
        <>
            <TouchableOpacity
                style={rrStyles.row}
                activeOpacity={0.75}
                accessibilityLabel={`${item.exercise}: ${item.delta}`}
            >
                <View style={rrStyles.left}>
                    <Text style={rrStyles.exercise}>{item.exercise}</Text>
                    <Text style={rrStyles.reason} numberOfLines={1}>{item.reason}</Text>
                </View>
                <View style={[rrStyles.badge, { backgroundColor: color + '18' }]}>
                    <Text style={[rrStyles.delta, { color }]}>{item.delta}</Text>
                </View>
            </TouchableOpacity>
            {!isLast && <View style={rrStyles.sep} />}
        </>
    );
};

const rrStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        columnGap: 10,
    },
    left: { flex: 1 },
    exercise: {
        fontSize: ACT.font.label,
        fontWeight: '700',
        color: ACT.textPrimary,
    },
    reason: {
        fontSize: ACT.font.micro,
        color: ACT.textMuted,
        marginTop: 2,
        fontWeight: '400',
    },
    badge: {
        borderRadius: ACT.radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 72,
        alignItems: 'center',
    },
    delta: {
        fontSize: ACT.font.label,
        fontWeight: '800',
    },
    sep: {
        height: 1,
        backgroundColor: '#F0EBF7',
    },
});

// ── MetricBadge ─────────────────────────────────────────────────
const MetricBadge: React.FC<{
    value: string;
    label: string;
    color?: string;
}> = ({ value, label, color = ACT.accent }) => (
    <View style={[mbStyles.badge, { backgroundColor: color + '14' }]}>
        <Text style={[mbStyles.value, { color }]}>{value}</Text>
        <Text style={mbStyles.label}>{label}</Text>
    </View>
);

const mbStyles = StyleSheet.create({
    badge: {
        borderRadius: ACT.radius.md,
        padding: 12,
        alignItems: 'center',
        minWidth: 72,
    },
    value: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    label: {
        fontSize: ACT.font.micro,
        color: ACT.textMuted,
        marginTop: 3,
        fontWeight: '500',
    },
});

// ──────────────────────────────────────────────────────────────────
// SECTION: SUGGESTED EXERCISES
// ──────────────────────────────────────────────────────────────────
const SuggestedExercisesCard: React.FC<{ onSuggestionPress: (suggestion: ExerciseSuggestion) => void }> = ({ onSuggestionPress }) => (
    <CoachCard
        title="Suggested Exercises"
        icon="bulb-outline"
        rightContent={
            <Text style={caStyles.seeAll}>This week</Text>
        }
    >
        {EXERCISE_SUGGESTIONS.map(s => (
            <SuggestionPillPressable
                key={s.id}
                suggestion={s}
                onPress={() => onSuggestionPress(s)}
            />
        ))}
    </CoachCard>
);

// ──────────────────────────────────────────────────────────────────
// SECTION: REST TIME SUGGESTION
// ──────────────────────────────────────────────────────────────────
const RestTimeSuggestionCard: React.FC = () => (
    <CoachCard title="Rest Time Suggestion" icon="timer-outline">
        <View style={rtStyles.highlight}>
            <Ionicons name="checkmark-circle" size={20} color={ACT.success} />
            <View style={rtStyles.highlightText}>
                <Text style={rtStyles.highlightMain}>90 seconds between sets</Text>
                <Text style={rtStyles.highlightSub}>
                    Optimal for hypertrophy-focused training at your current intensity.
                </Text>
            </View>
        </View>
        <View style={rtStyles.metricsRow}>
            <MetricBadge value="90s" label="Strength" color={ACT.accent} />
            <MetricBadge value="60s" label="Endurance" color={ACT.warning} />
            <MetricBadge value="120s" label="Power" color={ACT.success} />
        </View>
    </CoachCard>
);

const rtStyles = StyleSheet.create({
    highlight: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: ACT.successDim,
        borderRadius: ACT.radius.md,
        padding: 14,
        columnGap: 10,
        marginBottom: ACT.spacing.sm + 4,
        borderWidth: 1,
        borderColor: ACT.success + '28',
    },
    highlightText: { flex: 1 },
    highlightMain: {
        fontSize: ACT.font.label,
        fontWeight: '700',
        color: ACT.success,
        marginBottom: 3,
    },
    highlightSub: {
        fontSize: ACT.font.caption,
        color: '#3D8B40',
        lineHeight: 17,
        fontWeight: '400',
    },
    metricsRow: {
        flexDirection: 'row',
        columnGap: 8,
    },
});

// ──────────────────────────────────────────────────────────────────
// SECTION: WEIGHT SUGGESTIONS
// ──────────────────────────────────────────────────────────────────
const WeightSuggestionsCard: React.FC = () => (
    <CoachCard title="Weight Adjustments" icon="barbell-outline">
        {WEIGHT_SUGGESTIONS.map((item, i) => (
            <RecommendationRow
                key={item.id}
                item={item}
                isLast={i === WEIGHT_SUGGESTIONS.length - 1}
            />
        ))}
    </CoachCard>
);

// ──────────────────────────────────────────────────────────────────
// SECTION: RECOVERY ADVICE
// ──────────────────────────────────────────────────────────────────
const RecoveryAdviceCard: React.FC = () => (
    <CoachCard title="Recovery Advice" icon="heart-outline">
        {RECOVERY_ADVICE.map((item, i) => (
            <View key={item.id} style={raStyles.row}>
                <View style={raStyles.bullet} />
                <Text style={raStyles.text}>{item.text}</Text>
            </View>
        ))}
    </CoachCard>
);

const raStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 8,
        paddingVertical: 6,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ACT.accent,
        marginTop: 7,
    },
    text: {
        flex: 1,
        fontSize: ACT.font.label,
        color: ACT.textSecondary,
        lineHeight: 20,
        fontWeight: '500',
    },
});

// Shared styles referenced in card sections
const caStyles = StyleSheet.create({
    seeAll: {
        fontSize: ACT.font.micro,
        color: ACT.accent,
        fontWeight: '600',
    },
});

// ──────────────────────────────────────────────────────────────────
// AI COACH SCREEN
// ──────────────────────────────────────────────────────────────────
const AICoachScreen: React.FC = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(18)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start();
    }, []);

    const openSuggestion = (suggestion: ExerciseSuggestion) => {
        Alert.alert('Exercise suggestion', `${suggestion.name}\n\n${suggestion.description}`);
    };

    useEffect(() => {
        const unsubscribe = subscribeVoiceAction((action) => {
            if (action === 'ask_coach') {
                Alert.alert('AI Coach', 'Voice command received. Tell me what you want to improve.');
                return;
            }

            if (action === 'open_pike_pushups') {
                const item = EXERCISE_SUGGESTIONS.find((s) => s.id === 'ex1');
                if (item) openSuggestion(item);
                return;
            }

            if (action === 'open_romanian_deadlifts') {
                const item = EXERCISE_SUGGESTIONS.find((s) => s.id === 'ex2');
                if (item) openSuggestion(item);
                return;
            }

            if (action === 'open_face_pulls') {
                const item = EXERCISE_SUGGESTIONS.find((s) => s.id === 'ex3');
                if (item) openSuggestion(item);
            }
        });

        return unsubscribe;
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={ACT.bgPrimary} />
            <SafeAreaView style={styles.safe} edges={['top']}>

                {/* Header card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerInner}>
                        <View>
                            <Text style={styles.headerTitle}>Smart Recommendations</Text>
                            <Text style={styles.headerSub}>
                                Personalized advice from your AI coach
                            </Text>
                        </View>
                        <View style={styles.aiBadge}>
                            <Ionicons name="sparkles" size={18} color={ACT.accent} />
                        </View>
                    </View>

                    {/* Quick stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>92%</Text>
                            <Text style={styles.statLabel}>Rep Quality</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>24</Text>
                            <Text style={styles.statLabel}>Workouts</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: ACT.success }]}>↑ 18%</Text>
                            <Text style={styles.statLabel}>Improvement</Text>
                        </View>
                    </View>
                </View>

                {/* Scrollable cards */}
                <Animated.ScrollView
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <SuggestedExercisesCard onSuggestionPress={openSuggestion} />
                    <RestTimeSuggestionCard />
                    <WeightSuggestionsCard />
                    <RecoveryAdviceCard />

                    {/* Ask Coach button */}
                    <TouchableOpacity
                        style={styles.askBtn}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Ask your AI Coach a question"
                        onPress={() => Alert.alert('AI Coach', 'Tell me your goal, and I will guide your next workout step.')}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.askBtnText}>Ask Your Coach</Text>
                    </TouchableOpacity>
                </Animated.ScrollView>
            </SafeAreaView>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = ACT;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: ACT.bgPrimary,
    },
    safe: { flex: 1 },

    // Header
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
        shadowRadius: 14,
        elevation: 8,
        marginBottom: S.md,
    },
    headerInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: S.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: ACT.bgPrimary,
        letterSpacing: 0.2,
    },
    headerSub: {
        fontSize: F.caption,
        color: 'rgba(107,63,160,0.65)',
        marginTop: 3,
        fontWeight: '400',
    },
    aiBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: ACT.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Quick stats
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F8F4FC',
        borderRadius: R.md,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        rowGap: 3,
    },
    statValue: {
        fontSize: F.label,
        fontWeight: '800',
        color: ACT.textPrimary,
    },
    statLabel: {
        fontSize: F.micro,
        color: ACT.textMuted,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E8E0F0',
        marginVertical: 6,
    },

    // Scroll
    scrollContent: {
        paddingTop: 4,
        paddingBottom: 40,
    },

    // Ask Coach
    askBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: ACT.buttonHeight,
        backgroundColor: ACT.bgDark,
        borderRadius: R.xl,
        marginHorizontal: S.lg,
        marginTop: S.sm,
        columnGap: 10,
        shadowColor: ACT.bgDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.40,
        shadowRadius: 14,
        elevation: 8,
    },
    askBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});

export default AICoachScreen;