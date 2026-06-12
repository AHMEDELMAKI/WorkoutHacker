// src/features/main/screens/HomeScreen.tsx
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { subscribeVoiceAction } from '../../../services/voiceActionBus';
import { speakWorkoutStart, speak } from '../../../services/ttsService';
import { useAuthStore } from '../../../store/authStore';
import {
    ensureVoskModel,
    startVosk,
    stopVosk,
    subscribeVoskResults,
} from '../../../services/voskService';
import { fullBodyExercises, upperBodyExercises, lowerBodyExercises, type ExerciseType } from '../../workout/data/workoutData';



import {
    Alert,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import { RECENT_ACTIVITY, TODAYS_WORKOUT } from '../../home/data/homeData';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

import { analyticsApi, AnalyticsSummary } from '../../../services/api/analytics.api';
import { sessionApi, WorkoutSession } from '../../../services/api/session.api';

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const user = useAuthStore(s => s.user);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [voiceActive, setVoiceActive] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState('Voice control is inactive.');
    const [lastVoiceText, setLastVoiceText] = useState('None yet');
    const [lastVoiceTime, setLastVoiceTime] = useState('');

    // Live Data State
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);

    const openFatigueCheck = () => {
        navigation.getParent()?.navigate('FatigueCheck' as never);
    };

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
        fetchLiveData();
    }, []);

    const fetchLiveData = async () => {
        try {
            setLoading(true);
            const [sum, sess] = await Promise.all([
                analyticsApi.getSummary().catch(() => null),
                sessionApi.getSessions().catch(() => null),
            ]);
            
            if (sum) setSummary(sum);
            
            // Handle both { sessions: [] } and direct [] formats
            if (sess) {
                const sessionsList = Array.isArray(sess) ? sess : (sess.sessions || []);
                setRecentSessions(sessionsList);
            } else {
                setRecentSessions([]);
            }
        } catch (error) {
            console.error('[HomeScreen] Failed to fetch live data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Create exercise action mapping
        const createExerciseMap = () => {
            const map: Record<string, ExerciseType | undefined> = {};

            // Full body exercises
            fullBodyExercises.forEach(exercise => {
                const key = `do_${exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')}`;
                map[key] = exercise;
            });

            // Upper body exercises
            upperBodyExercises.forEach(exercise => {
                const key = `do_${exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')}`;
                map[key] = exercise;
            });

            // Lower body exercises
            lowerBodyExercises.forEach(exercise => {
                const key = `do_${exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')}`;
                map[key] = exercise;
            });

            return map;
        };

        const exerciseMap = createExerciseMap();

        const unsubscribe = subscribeVoiceAction((action) => {
            if (action === 'home_start_workout') {
                void speakWorkoutStart();
                navigation.navigate('Workout');
                return;
            }

            if (action === 'home_check_fatigue') {
                openFatigueCheck();
                void speak('Opening fatigue check');
                return;
            }

            if (action === 'open_full_body_workout') {
                navigation.navigate('Workout', { screen: 'FullBodyWorkout' });
                void speak('Opening full body workout');
                return;
            }

            if (action === 'open_upper_body_workout') {
                navigation.navigate('Workout', { screen: 'UpperWorkout' });
                void speak('Opening upper body workout');
                return;
            }

            if (action === 'open_lower_body_workout') {
                navigation.navigate('Workout', { screen: 'LowerWorkout' });
                void speak('Opening lower body workout');
                return;
            }

            if (action === 'open_custom_workout') {
                navigation.navigate('Workout', { screen: 'CustomWorkout' });
                void speak('Opening custom workout');
                return;
            }

            if (action === 'start_workout') {
                void speakWorkoutStart();
                navigation.navigate('Workout');
                return;
            }

            if (action === 'end_workout') {
                navigation.navigate('Home');
                void speak('Workout ended');
                return;
            }

            // Handle specific exercise actions
            const exercise = exerciseMap[action];
            if (exercise) {
                navigation.navigate('Workout', {
                    screen: 'ExerciseDetails',
                    params: { exercise }
                });
                void speak(`Opening ${exercise.name}`);
                return;
            }
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const unsubscribe = subscribeVoskResults((text) => {
            const trimmed = text.trim();
            if (trimmed.length === 0) {
                return;
            }
            setLastVoiceText(trimmed);
            setLastVoiceTime(new Date().toLocaleTimeString());
        });

        return unsubscribe;
    }, []);

    const activateVoiceControl = async () => {
        try {
            setVoiceStatus('Activating voice control...');
            await ensureVoskModel();
            await startVosk();
            setVoiceActive(true);
            setVoiceStatus('Voice control is active.');
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setVoiceStatus('Voice control activation failed.');
            Alert.alert('Voice Control', `Could not activate voice control. ${message}`);
        }
    };

    const deactivateVoiceControl = async () => {
        try {
            await stopVosk();
            setVoiceActive(false);
            setVoiceStatus('Voice control is stopped.');
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setVoiceStatus('Voice control stop failed.');
            Alert.alert('Voice Control', `Could not stop voice control. ${message}`);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />

            {/* SECTION 1 — HEADER */}
            <View style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerInner}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.welcome}>Welcome, {user?.displayName || 'Champion'} 👋</Text>
                            <Text style={styles.welcomeSub}>Ready for your workout today?</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.avatarCircle}
                            onPress={() => navigation.navigate('ProfileStack')}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Settings"
                        >
                            <Ionicons name="settings-outline" size={20} color={WT.colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* SECTION 2 — TODAY WORKOUT CARD */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.cardHeaderBadge}>
                                <Text style={styles.cardHeaderBadgeText}>TODAY</Text>
                            </View>
                            <Text style={styles.cardHeaderRight}>⚡ Moderate</Text>
                        </View>
                        <Text style={styles.todayTitle}>{TODAYS_WORKOUT.title}</Text>
                        <Text style={styles.todaySub}>
                            {TODAYS_WORKOUT.duration} min · {TODAYS_WORKOUT.calories} kcal ·{' '}
                            {TODAYS_WORKOUT.muscleGroups.join(', ')}
                        </Text>
                        <TouchableOpacity
                            style={styles.startBtn}
                            onPress={async () => {
                                await speakWorkoutStart();
                                navigation.navigate('Workout');
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.startBtnText}>Start Workout  →</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={openFatigueCheck}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.secondaryBtnText}>Check Fatigue Level</Text>
                        </TouchableOpacity>
                        <View style={styles.voiceControlRow}>
                            <TouchableOpacity
                                style={[
                                    styles.voiceControlBtn,
                                    styles.voiceControlBtnLeft,
                                    voiceActive ? styles.voiceControlBtnDisabled : styles.voiceControlBtnPrimary,
                                ]}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Activate voice control"
                                onPress={activateVoiceControl}
                                disabled={voiceActive}
                            >
                                <Text style={styles.voiceControlBtnText}>Activate Voice Control</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.voiceControlBtn,
                                    !voiceActive ? styles.voiceControlBtnSecondaryInactive : styles.voiceControlBtnSecondaryActive,
                                ]}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Stop voice control"
                                onPress={deactivateVoiceControl}
                                disabled={!voiceActive}
                            >
                                <Text style={styles.voiceControlBtnText}>Stop Voice Control</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.voiceText}>{voiceStatus}</Text>
                        <View style={styles.voiceDebugBox}>
                            <Text style={styles.voiceDebugLabel}>Voice debug</Text>
                            <Text style={styles.voiceDebugText}>Last recognized phrase:</Text>
                            <Text style={styles.voiceDebugValue}>{lastVoiceText}</Text>
                            <Text style={styles.voiceDebugTime}>{lastVoiceTime ? `Updated ${lastVoiceTime}` : ''}</Text>
                        </View>
                    </View>

                    {/* SECTION 3 — LAST SESSION SUMMARY */}
                    {recentSessions.length > 0 && (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('ProgressStack')}
                            activeOpacity={0.85}
                        >
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.sectionTitle}>Last Session</Text>
                                <Ionicons name="chevron-forward" size={16} color={WT.colors.textMuted} />
                            </View>
                            <View style={styles.sessionRow}>
                                {[
                                    { label: 'Duration', value: `${recentSessions[0].durationMin || 0} min`, icon: 'time-outline' as const },
                                    { label: 'Type', value: recentSessions[0].workoutType.split(' ')[0], icon: 'repeat-outline' as const },
                                    { label: 'Form Score', value: `${recentSessions[0].formScore || 0}%`, icon: 'star-outline' as const },
                                ].map(item => (
                                    <View key={item.label} style={styles.sessionItem}>
                                        <View style={styles.sessionIconCircle}>
                                            <Ionicons name={item.icon} size={16} color={WT.colors.primary} />
                                        </View>
                                        <Text style={styles.sessionValue}>{item.value}</Text>
                                        <Text style={styles.sessionLabel}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* SECTION 4 — STREAK CARD */}
                    <View style={styles.streakCard}>
                        <View style={styles.streakLeft}>
                            <Text style={styles.streakEmoji}>🔥</Text>
                        </View>
                        <View style={styles.streakRight}>
                            <Text style={styles.streakTitle}>{summary?.currentStreak || 0} Day Streak!</Text>
                            <Text style={styles.streakSub}>
                                {summary?.currentStreak && summary.currentStreak > 0 
                                    ? "Keep it up! You're on fire!" 
                                    : "Start your first workout today!"}
                            </Text>
                        </View>
                        <View style={styles.streakBadge}>
                            <Text style={styles.streakBadgeText}>🏆</Text>
                        </View>
                    </View>

                    {/* SECTION 5 — QUICK STATUS */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>All Time</Text>
                        <View style={styles.statusGrid}>
                            <View style={styles.statusItem}>
                                <Text style={styles.statusValue}>{summary?.totalWorkouts || 0}</Text>
                                <Text style={styles.statusLabel}>Workouts</Text>
                            </View>
                            <View style={styles.statusDivider} />
                            <View style={styles.statusItem}>
                                <Text style={styles.statusValue}>{Math.round(summary?.avgFormScore || 0)}%</Text>
                                <Text style={styles.statusLabel}>Avg Form</Text>
                            </View>
                            <View style={styles.statusDivider} />
                            <View style={styles.statusItem}>
                                <Text style={[styles.statusValue, { color: WT.colors.success }]}>
                                    {Math.round((summary?.totalCaloriesBurned || 0) / 1000)}k
                                </Text>
                                <Text style={styles.statusLabel}>kCal Burned</Text>
                            </View>
                        </View>
                    </View>

                    {/* Recent activity */}
                    {recentSessions.length > 0 && (
                        <>
                            <Text style={styles.recentTitle}>Recent Activity</Text>
                            {recentSessions.slice(0, 5).map(activity => (
                                <TouchableOpacity
                                    key={activity.id}
                                    style={styles.activityCard}
                                    onPress={() => navigation.navigate('ProgressStack')}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.activityIcon}>
                                        <Text style={styles.activityEmoji}>💪</Text>
                                    </View>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityName}>{activity.title || activity.workoutType}</Text>
                                        <Text style={styles.activitySub}>
                                            {new Date(activity.startedAt).toLocaleDateString()} · {activity.durationMin || 0} min · {activity.caloriesBurned || 0} kcal
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={WT.colors.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: WT.colors.background },

    // Header
    header: {
        backgroundColor: WT.colors.header,
        paddingHorizontal: WT.spacing.lg,
        paddingBottom: WT.spacing.lg,
        borderBottomLeftRadius: WT.radius.lg,
        borderBottomRightRadius: WT.radius.lg,
        shadowColor: '#4A2878',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: WT.spacing.md,
    },
    headerLeft: { flex: 1, marginRight: WT.spacing.md },
    welcome: { fontSize: 22, fontWeight: '800', color: WT.colors.textLight, marginBottom: 4 },
    welcomeSub: { fontSize: 14, color: 'rgba(255,255,255,0.78)', fontWeight: '500' },
    avatarCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },

    content: { padding: WT.spacing.lg, paddingTop: WT.spacing.xl, paddingBottom: 24 },

    // Generic card
    card: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        padding: WT.spacing.lg,
        marginBottom: WT.spacing.md,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: WT.colors.textDark, marginBottom: WT.spacing.md },

    // Today workout card
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: WT.spacing.sm },
    cardHeaderBadge: {
        backgroundColor: WT.colors.primary,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    cardHeaderBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
    cardHeaderRight: { fontSize: 12, color: WT.colors.textMuted, fontWeight: '500' },
    todayTitle: { fontSize: 20, fontWeight: '800', color: WT.colors.textDark, marginBottom: 4 },
    todaySub: { fontSize: 13, color: WT.colors.textMuted, marginBottom: WT.spacing.md, lineHeight: 18 },
    startBtn: {
        backgroundColor: WT.colors.primary,
        borderRadius: WT.radius.xl,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A2878',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    startBtnText: { fontSize: 15, fontWeight: '800', color: WT.colors.textLight },
    secondaryBtn: {
        marginTop: WT.spacing.sm,
        borderRadius: WT.radius.xl,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: WT.colors.primary,
        backgroundColor: 'rgba(140,92,196,0.08)',
    },
    secondaryBtnText: { fontSize: 14, fontWeight: '800', color: WT.colors.primary },
    voiceControlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: WT.spacing.md,
    },
    voiceControlBtnLeft: {
        marginRight: WT.spacing.sm,
    },
    voiceControlBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 46,
        borderRadius: WT.radius.xl,
        paddingHorizontal: WT.spacing.md,
    },
    voiceControlBtnPrimary: {
        backgroundColor: WT.colors.primary,
    },
    voiceControlBtnSecondaryActive: {
        backgroundColor: '#6b7280',
    },
    voiceControlBtnSecondaryInactive: {
        backgroundColor: 'rgba(135,91,164,0.16)',
    },
    voiceControlBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    voiceControlBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: WT.colors.textLight,
    },
    voiceText: {
        marginTop: WT.spacing.sm,
        fontSize: 13,
        color: WT.colors.textDark,
        textAlign: 'center',
        fontWeight: '700',
    },
    voiceDebugBox: {
        marginTop: WT.spacing.sm,
        padding: WT.spacing.md,
        borderRadius: WT.radius.md,
        backgroundColor: WT.colors.textLight,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    voiceDebugLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: WT.colors.textDark,
        marginBottom: 6,
    },
    voiceDebugText: {
        fontSize: 12,
        color: WT.colors.textDark,
        marginBottom: 4,
    },
    voiceDebugValue: {
        fontSize: 14,
        fontWeight: '700',
        color: WT.colors.textDark,
        marginBottom: 2,
    },
    voiceDebugTime: {
        fontSize: 11,
        color: '#444444',
    },

    // Last session
    sessionRow: { flexDirection: 'row', justifyContent: 'space-around' },
    sessionItem: { alignItems: 'center', gap: 4 },
    sessionIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(140,92,196,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    sessionValue: { fontSize: 17, fontWeight: '800', color: WT.colors.textDark },
    sessionLabel: { fontSize: 11, color: WT.colors.textMuted },

    // Streak card
    streakCard: {
        backgroundColor: WT.colors.primary,
        borderRadius: WT.radius.md,
        padding: WT.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: WT.spacing.md,
        shadowColor: '#4A2878',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    streakLeft: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: WT.spacing.md,
        flexShrink: 0,
    },
    streakEmoji: { fontSize: 24 },
    streakRight: { flex: 1 },
    streakTitle: { fontSize: 18, fontWeight: '800', color: WT.colors.textLight, marginBottom: 2 },
    streakSub: { fontSize: 13, color: 'rgba(255,255,255,0.80)', fontWeight: '500' },
    streakBadge: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    streakBadgeText: { fontSize: 20 },

    // Quick status
    statusGrid: { flexDirection: 'row', alignItems: 'center' },
    statusItem: { flex: 1, alignItems: 'center', gap: 4 },
    statusDivider: { width: 1, height: 40, backgroundColor: WT.colors.cardBorder },
    statusValue: { fontSize: 20, fontWeight: '800', color: WT.colors.primary },
    statusLabel: { fontSize: 11, color: WT.colors.textMuted },

    // Recent activity
    recentTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: WT.colors.textLight,
        marginBottom: WT.spacing.md,
    },
    activityCard: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        padding: WT.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: WT.spacing.sm,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    activityIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(140,92,196,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: WT.spacing.md,
        flexShrink: 0,
    },
    activityEmoji: { fontSize: 20 },
    activityInfo: { flex: 1 },
    activityName: { fontSize: 15, fontWeight: '700', color: WT.colors.textDark, marginBottom: 2 },
    activitySub: { fontSize: 12, color: WT.colors.textMuted },
});

export default HomeScreen;
