// src/features/workout/screens/ExerciseDetailsScreen.tsx
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../components/PrimaryWorkoutButton';
import WorkoutHeader from '../components/WorkoutHeader';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'ExerciseDetails'>;

const ExerciseDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { exercise } = route.params;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
            <WorkoutHeader
                title={exercise.name}
                subtitle={exercise.targetMuscles}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Exercise image placeholder */}
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.bigEmoji}>{exercise.emoji}</Text>
                    <Text style={styles.imageLabel}>Exercise Demonstration</Text>
                </View>

                {/* Stats row */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{exercise.sets}</Text>
                        <Text style={styles.statSub}>Sets</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{exercise.reps}</Text>
                        <Text style={styles.statSub}>Reps</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>60s</Text>
                        <Text style={styles.statSub}>Rest</Text>
                    </View>
                </View>

                {/* Target muscles */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="body-outline" size={18} color={WT.colors.primary} />
                        <Text style={styles.infoTitle}>Target Muscles</Text>
                    </View>
                    <Text style={styles.infoBody}>{exercise.targetMuscles}</Text>
                </View>

                {/* Form Tips */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="flash-outline" size={18} color={WT.colors.warning} />
                        <Text style={styles.infoTitle}>Form Tips</Text>
                    </View>
                    {exercise.tips.map((tip: string, i: number) => (
                        <View key={i} style={styles.tipRow}>
                            <View style={styles.tipBullet} />
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

                {/* Start button */}
                <View style={styles.startBtn}>
                    <PrimaryWorkoutButton
                        label="Start Exercise 🚀"
                        variant="white"
                        onPress={() => navigation.navigate('Tracking', { exercise })}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: WT.colors.background },
    content: { paddingBottom: 40 },

    imagePlaceholder: {
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.10)',
        margin: WT.spacing.lg,
        borderRadius: WT.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.20)',
        gap: WT.spacing.sm,
    },
    bigEmoji: { fontSize: 64 },
    imageLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },

    statsCard: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        marginHorizontal: WT.spacing.lg,
        marginBottom: WT.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        padding: WT.spacing.lg,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '800', color: WT.colors.primary, marginBottom: 4 },
    statSub: { fontSize: 12, color: WT.colors.textMuted },
    statDivider: { width: 1, height: 40, backgroundColor: WT.colors.cardBorder },

    infoCard: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        marginHorizontal: WT.spacing.lg,
        marginBottom: WT.spacing.md,
        padding: WT.spacing.lg,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: WT.spacing.xs,
        marginBottom: WT.spacing.sm,
    },
    infoTitle: { fontSize: 14, fontWeight: '700', color: WT.colors.textDark },
    infoBody: { fontSize: 14, color: WT.colors.textMuted, lineHeight: 20 },

    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: WT.spacing.sm,
        paddingVertical: 4,
    },
    tipBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: WT.colors.primary,
        marginTop: 8,
        flexShrink: 0,
    },
    tipText: { flex: 1, fontSize: 14, color: WT.colors.textMuted, lineHeight: 22 },

    startBtn: {
        marginHorizontal: WT.spacing.lg,
        marginTop: WT.spacing.md,
    },
});

export default ExerciseDetailsScreen;
