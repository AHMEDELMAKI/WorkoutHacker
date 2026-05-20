// File: src/features/home/components/TodayWorkoutCard.tsx  (UPDATED — onStart prop)
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import AppText from '../../../components/AppText';
import { Colors, Spacing, BorderRadius } from '../../../theme';
import type { WorkoutCard } from '../data/homeData';

interface Props { workout: WorkoutCard; onStart?: () => void; }

const DIFF_COLORS: Record<string, string> = {
    Easy: '#10B981', Moderate: '#F59E0B', Hard: '#EF4444', Intense: '#7C3AED',
};

const TodayWorkoutCard: React.FC<Props> = ({ workout, onStart }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
    const pressOut = () => Animated.spring(scale, { toValue: 1.00, useNativeDriver: true, speed: 50 }).start();
    const diffColor = DIFF_COLORS[workout.difficulty] ?? Colors.primary;

    return (
        <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
            <TouchableOpacity onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1} style={styles.card}>
                <View style={[styles.glow, { backgroundColor: workout.accentColor }]} />
                <View style={styles.headerRow}>
                    <View style={[styles.typeBadge, { borderColor: workout.accentColor + '66' }]}>
                        <View style={[styles.typeDot, { backgroundColor: workout.accentColor }]} />
                        <AppText variant="caption" color={workout.accentColor}>{workout.type}</AppText>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: diffColor + '22', borderColor: diffColor + '55' }]}>
                        <AppText variant="caption" color={diffColor}>{workout.difficulty}</AppText>
                    </View>
                </View>
                <AppText variant="h2" style={styles.title}>{workout.title}</AppText>
                <View style={styles.muscleRow}>
                    {workout.muscleGroups.map(m => (
                        <View key={m} style={styles.muscleChip}>
                            <AppText variant="caption" color={Colors.textSecondary}>{m}</AppText>
                        </View>
                    ))}
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <AppText variant="h3" color={Colors.primaryLight}>{workout.duration}</AppText>
                        <AppText variant="caption" color={Colors.textMuted}>min</AppText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <AppText variant="h3" color={Colors.primaryLight}>{workout.calories}</AppText>
                        <AppText variant="caption" color={Colors.textMuted}>kcal</AppText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <AppText variant="h3" color={Colors.primaryLight}>{workout.muscleGroups.length}</AppText>
                        <AppText variant="caption" color={Colors.textMuted}>muscles</AppText>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: workout.accentColor }]}
                    onPress={onStart}
                    activeOpacity={0.85}
                >
                    <AppText variant="label" color={Colors.white} align="center">Start Workout →</AppText>
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xxl },
    card: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.surfaceBorder, overflow: 'hidden' },
    glow: { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, opacity: 0.07 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 3 },
    typeDot: { width: 6, height: 6, borderRadius: 3 },
    diffBadge: { borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 3 },
    title: { marginBottom: Spacing.md },
    muscleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
    muscleChip: { backgroundColor: Colors.background, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl, backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md },
    statItem: { flex: 1, alignItems: 'center', gap: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: Colors.surfaceBorder },
    startBtn: { height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
});

export default TodayWorkoutCard;