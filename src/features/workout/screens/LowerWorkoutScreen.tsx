// src/features/workout/screens/LowerWorkoutScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../components/PrimaryWorkoutButton';
import WorkoutHeader from '../components/WorkoutHeader';
import { ExerciseType, lowerBodyExercises } from '../data/workoutData';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'LowerWorkout'>;

const ExerciseCard: React.FC<{ exercise: ExerciseType; onStart: () => void }> = ({
    exercise,
    onStart,
}) => (
    <View style={styles.exerciseCard}>
        <View style={styles.emojiBox}>
            <Text style={styles.emoji}>{exercise.emoji}</Text>
        </View>
        <View style={styles.exerciseInfo}>
            <Text style={styles.exName}>{exercise.name}</Text>
            <Text style={styles.exSub}>{exercise.targetMuscles}</Text>
            <Text style={styles.exSub}>{exercise.sets} sets · {exercise.reps}</Text>
        </View>
        <TouchableOpacity onPress={onStart} style={styles.startPill} activeOpacity={0.8}>
            <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
    </View>
);

const LowerWorkoutScreen: React.FC<Props> = ({ navigation }) => (
    <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
        <WorkoutHeader
            title="Lower Body 🦵"
            subtitle="5 exercises · 40 min"
            showBack
            onBack={() => navigation.goBack()}
        />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>EXERCISES</Text>
            {lowerBodyExercises.map(ex => (
                <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    onStart={() => navigation.navigate('ExerciseDetails', { exercise: ex })}
                />
            ))}
            <View style={styles.bottomBtn}>
                <PrimaryWorkoutButton
                    label="Start Your Workout"
                    variant="white"
                    onPress={() =>
                        navigation.navigate('ExerciseDetails', { exercise: lowerBodyExercises[0] })
                    }
                />
            </View>
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: WT.colors.background },
    content: { padding: WT.spacing.lg, paddingTop: WT.spacing.xl, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: WT.colors.textMuted,
        letterSpacing: 1.2,
        marginBottom: WT.spacing.md,
    },
    exerciseCard: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        padding: WT.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: WT.spacing.sm,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    emojiBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(196,92,140,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: WT.spacing.md,
        flexShrink: 0,
    },
    emoji: { fontSize: 22 },
    exerciseInfo: { flex: 1 },
    exName: { fontSize: 16, fontWeight: '700', color: WT.colors.textDark, marginBottom: 3 },
    exSub: { fontSize: 12, color: WT.colors.textMuted, lineHeight: 16 },
    startPill: {
        backgroundColor: '#C45C8C',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        flexShrink: 0,
    },
    startText: { fontSize: 12, fontWeight: '700', color: WT.colors.textLight },
    bottomBtn: { marginTop: WT.spacing.xl },
});

export default LowerWorkoutScreen;
