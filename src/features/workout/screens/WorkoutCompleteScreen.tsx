// src/features/workout/screens/WorkoutCompleteScreen.tsx
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { speak } from '../../../services/ttsService';
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
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PerformanceBar from '../components/PerformanceBar';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutComplete'>;

const WorkoutCompleteScreen: React.FC<Props> = ({ route, navigation }) => {
    const { workoutType } = route.params;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }),
        ]).start();

        // Announce completion via TTS (non-blocking)
        void (async () => {
            try {
                await speak('Workout complete. Great job today!');
            } catch (e) {
                // ignore TTS errors — non-critical
            }
        })();
    }, []);

    const goHome = () => {
        navigation.getParent()?.navigate('Home');
    };
    
    const openFatigueCheck = () => {
        navigation.getParent()?.navigate('FatigueCheck' as never);
    };
    const muscleFocusGroups = workoutType
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

    const session = {
        duration: '32 min',
        totalReps: '48',
        setsCompleted: '12',
        calories: '280 kcal',
        muscleFocus: muscleFocusGroups.slice(0, 3),
        score: 84,
        suggestions: [
            'Slow down your tempo for better muscle activation.',
            'Keep your core braced throughout every rep.',
            'Increase weight by 5% next session to keep progressing.',
        ],
    };

    // Deterministic values instead of Math.random to avoid re-render issues
    const performanceBars = session.muscleFocus.map((m: string, i: number) => ({
        label: m,
        value: 70 + i * 8,
    }));

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={WT.colors.primaryDark} />
            <SafeAreaView edges={['top']} style={styles.safe}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero celebration */}
                    <Animated.View
                        style={[styles.hero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
                    >
                        <View style={styles.heroCircle}>
                            <Text style={styles.heroEmoji}>🎉</Text>
                        </View>
                        <Text style={styles.heroTitle}>Workout Complete!</Text>
                        <Text style={styles.heroSub}>Great job today! Keep up the streak! 💪</Text>
                    </Animated.View>

                    {/* Session Summary */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                        <Text style={styles.cardTitle}>Session Summary</Text>

                        {[
                            { icon: 'time-outline' as const, label: 'Duration', value: session.duration },
                            { icon: 'repeat-outline' as const, label: 'Total Reps', value: session.totalReps },
                            { icon: 'layers-outline' as const, label: 'Sets Completed', value: session.setsCompleted },
                            { icon: 'flame-outline' as const, label: 'Calories', value: session.calories },
                        ].map((row, i, arr) => (
                            <React.Fragment key={row.label}>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryIconWrap}>
                                        <Ionicons name={row.icon} size={18} color={WT.colors.primary} />
                                    </View>
                                    {/* Fixed-width label — MUST NOT WRAP VERTICALLY */}
                                    <View style={styles.summaryLabelWrap}>
                                        <Text style={styles.summaryLabel} numberOfLines={1}>{row.label}</Text>
                                    </View>
                                    <View style={styles.summaryValueWrap}>
                                        <Text style={styles.summaryValue}>{row.value}</Text>
                                    </View>
                                </View>
                                {i < arr.length - 1 && <View style={styles.rowDivider} />}
                            </React.Fragment>
                        ))}

                        {/* Muscle Focus row — stays horizontal */}
                        <View style={styles.rowDivider} />
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryIconWrap}>
                                <Ionicons name="body-outline" size={18} color={WT.colors.primary} />
                            </View>
                            <View style={styles.summaryLabelWrap}>
                                <Text style={styles.summaryLabel} numberOfLines={1}>Muscle Focus</Text>
                            </View>
                            <View style={styles.summaryValueWrap}>
                                <Text style={styles.summaryValue} numberOfLines={2}>
                                    {session.muscleFocus.join(', ')}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Performance */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                        <View style={styles.perfHeader}>
                            <Text style={styles.cardTitle}>Your Performance</Text>
                            <View style={styles.scoreBadge}>
                                <Text style={styles.scoreText}>{session.score}%</Text>
                            </View>
                        </View>
                        {performanceBars.map((bar: { label: string; value: number }) => (
                            <PerformanceBar key={bar.label} label={bar.label} value={bar.value} />
                        ))}
                    </Animated.View>

                    {/* Suggestions */}
                    <Animated.View style={[styles.sugCard, { opacity: fadeAnim }]}>
                        <View style={styles.sugHeader}>
                            <Ionicons name="flash" size={18} color={WT.colors.textLight} />
                            <Text style={styles.sugTitle}>Coach Says</Text>
                        </View>
                        {session.suggestions.map((s: string, i: number) => (
                            <View key={i} style={styles.sugRow}>
                                <View style={styles.sugBullet} />
                                <Text style={styles.sugText}>{s}</Text>
                            </View>
                        ))}
                    </Animated.View>
                </ScrollView>

                {/* Footer actions */}
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <TouchableOpacity style={styles.homeBtn} onPress={goHome} activeOpacity={0.85}>
                            <Ionicons name="home-outline" size={20} color={WT.colors.primary} />
                            <Text style={styles.homeBtnText} numberOfLines={1}>
                                Back to Home
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.fatigueBtn} onPress={openFatigueCheck} activeOpacity={0.85}>
                            <Ionicons name="pulse-outline" size={20} color={WT.colors.primary} />
                            <Text style={styles.fatigueBtnText} numberOfLines={1}>
                                Check Fatigue
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: WT.colors.primaryDark },
    safe: { flex: 1 },
    content: { paddingTop: WT.spacing.lg, paddingBottom: 16 },

    hero: { alignItems: 'center', paddingHorizontal: WT.spacing.lg, paddingBottom: WT.spacing.lg },
    heroCircle: {
        width: 84, height: 84, borderRadius: 42,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
    },
    heroEmoji: { fontSize: 40 },
    heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 6, textAlign: 'center' },
    heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.78)', textAlign: 'center', lineHeight: 22, fontWeight: '500' },

    card: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        marginHorizontal: WT.spacing.lg,
        marginBottom: WT.spacing.md,
        paddingHorizontal: WT.spacing.lg,
        paddingVertical: WT.spacing.md,
        shadowColor: 'rgba(107,63,160,0.22)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
    },
    cardTitle: { fontSize: 14, fontWeight: '800', color: WT.colors.textDark, marginBottom: 6, letterSpacing: 0.2 },

    // Horizontal layout — prevents "Muscle Focus" vertical wrapping
    summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
    summaryIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(140,92,196,0.12)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12, flexShrink: 0,
    },
    summaryLabelWrap: { flexShrink: 0, width: 110 },
    summaryLabel: { fontSize: 13, color: WT.colors.textMuted, fontWeight: '500' },
    summaryValueWrap: { flex: 1, alignItems: 'flex-end' },
    summaryValue: { fontSize: 14, fontWeight: '800', color: WT.colors.textDark, textAlign: 'right' },
    rowDivider: { height: 1, backgroundColor: WT.colors.cardBorder, marginLeft: 48 },

    perfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: WT.spacing.sm },
    scoreBadge: {
        backgroundColor: 'rgba(105,195,109,0.14)',
        borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 5,
    },
    scoreText: { fontSize: 14, fontWeight: '800', color: WT.colors.success },

    sugCard: {
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: WT.radius.md,
        marginHorizontal: WT.spacing.lg,
        marginBottom: WT.spacing.md,
        paddingHorizontal: WT.spacing.lg,
        paddingVertical: WT.spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    sugHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 },
    sugTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
    sugRow: { flexDirection: 'row', alignItems: 'flex-start', gap: WT.spacing.sm, paddingVertical: 5 },
    sugBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.65)', marginTop: 8, flexShrink: 0 },
    sugText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF', lineHeight: 22 },

    footer: { paddingHorizontal: WT.spacing.lg, paddingTop: WT.spacing.sm, paddingBottom: WT.spacing.lg },
    homeBtn: {
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: WT.radius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: 'rgba(107,63,160,0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 6,
    },
    homeBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: WT.colors.primary,
        textAlign: 'center',
        includeFontPadding: false,
    },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    fatigueBtn: {
        marginTop: WT.spacing.sm,
        borderRadius: WT.radius.xl,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: WT.colors.primary,
        backgroundColor: 'rgba(140,92,196,0.08)',
        paddingHorizontal: 16,
    },
    fatigueBtnText: { fontSize: 14, fontWeight: '800', color: WT.colors.primary },
});

export default WorkoutCompleteScreen;