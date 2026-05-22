// src/features/workout/screens/AbdominalWorkoutScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../components/PrimaryWorkoutButton';
import WorkoutHeader from '../components/WorkoutHeader';
import { ExerciseType } from '../data/workoutData';
import { getCategoryByRoute, getExercisesByRoute } from '../data/workoutCategoryHelpers';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'AbdominalWorkout'>;

const ExerciseCard: React.FC<{
    exercise: ExerciseType;
    onStart: () => void;
}> = ({ exercise, onStart }) => (
    <View style={styles.exerciseCard}>
        <View style={styles.exerciseInfo}>
            <Text style={styles.exName}>{exercise.name}</Text>
            <Text style={styles.exSub}>{exercise.targetMuscles}</Text>
            <Text style={styles.exSub}>
                {exercise.sets} sets · {exercise.reps} reps
            </Text>
        </View>
        <TouchableOpacity onPress={onStart} style={styles.startPill} activeOpacity={0.8}>
            <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
    </View>
);

const AbdominalWorkoutScreen: React.FC<Props> = ({ navigation }) => {
    const route = 'AbdominalWorkout' as const;
    const category = getCategoryByRoute(route);
    const exercises = getExercisesByRoute(route);

    const title = category?.title ?? 'Abdominal';
    const subtitle = category
        ? `${category.exerciseCount} exercises · ${category.duration}`
        : 'Exercises · Duration';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
            <WorkoutHeader
                title={title}
                subtitle={subtitle}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionLabel}>EXERCISES</Text>
                {exercises.map(ex => (
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
                        onPress={() => {
                            const first = exercises[0];
                            if (first) navigation.navigate('ExerciseDetails', { exercise: first });
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

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
    exerciseInfo: { flex: 1 },
    exName: { fontSize: 16, fontWeight: '700', color: WT.colors.textDark, marginBottom: 3 },
    exSub: { fontSize: 12, color: WT.colors.textMuted, lineHeight: 16 },
    startPill: {
        backgroundColor: WT.colors.primary,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        flexShrink: 0,
    },
    startText: { fontSize: 12, fontWeight: '700', color: WT.colors.textLight },
    bottomBtn: { marginTop: WT.spacing.xl },
});

export default AbdominalWorkoutScreen;
