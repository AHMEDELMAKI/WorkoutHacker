// src/features/workout/screens/CustomWorkoutScreen.tsx
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from '../../../components/AppText';
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import WorkoutHeader from '../components/WorkoutHeader';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'CustomWorkout'>;

interface CustomExercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
}

const CustomWorkoutScreen: React.FC<Props> = ({ navigation }) => {
    const [exercises, setExercises] = useState<CustomExercise[]>([
        { id: '1', name: 'Push-Ups', sets: '3', reps: '15' },
    ]);
    const [newName, setNewName] = useState('');

    const addExercise = () => {
        if (!newName.trim()) return;
        setExercises(prev => [
            ...prev,
            { id: Date.now().toString(), name: newName.trim(), sets: '3', reps: '10' },
        ]);
        setNewName('');
    };

    const removeExercise = (id: string) => {
        setExercises(prev => prev.filter(e => e.id !== id));
    };

    const updateField = (id: string, field: 'sets' | 'reps', value: string) => {
        setExercises(prev =>
            prev.map(e => (e.id === id ? { ...e, [field]: value } : e)),
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
            <WorkoutHeader
                title="Custom Workout ✏️"
                subtitle="Build your own routine"
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Add exercise input */}
                <View style={styles.addCard}>
                    <Text style={styles.addLabel}>Add Exercise</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Exercise name…"
                            placeholderTextColor={WT.colors.textMuted}
                            value={newName}
                            onChangeText={setNewName}
                            onSubmitEditing={addExercise}
                            returnKeyType="done"
                        />
                        <TouchableOpacity onPress={addExercise} style={styles.addBtn} activeOpacity={0.8}>
                            <Ionicons name="add" size={22} color={WT.colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Exercise list */}
                <Text style={styles.sectionLabel}>MY EXERCISES ({exercises.length})</Text>

                {exercises.map(ex => (
                    <View key={ex.id} style={styles.exCard}>
                        <View style={styles.exTop}>
                            <Text style={styles.exName}>{ex.name}</Text>
                            <TouchableOpacity
                                onPress={() => removeExercise(ex.id)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="trash-outline" size={18} color={WT.colors.danger} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.exFields}>
                            <View style={styles.fieldBox}>
                                <Text style={styles.fieldLabel}>Sets</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={ex.sets}
                                    onChangeText={v => updateField(ex.id, 'sets', v)}
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                            </View>
                            <View style={styles.fieldDivider} />
                            <View style={styles.fieldBox}>
                                <Text style={styles.fieldLabel}>Reps</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={ex.reps}
                                    onChangeText={v => updateField(ex.id, 'reps', v)}
                                    keyboardType="numeric"
                                    maxLength={3}
                                />
                            </View>
                        </View>
                    </View>
                ))}

                {exercises.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🏋️</Text>
                        <AppText variant="body" color={WT.colors.textMuted} style={styles.emptyText}>
                            No exercises yet.{'\n'}Add your first one above!
                        </AppText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: WT.colors.background },
    content: { padding: WT.spacing.lg, paddingTop: WT.spacing.xl, paddingBottom: 40 },
    addCard: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        padding: WT.spacing.lg,
        marginBottom: WT.spacing.lg,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    addLabel: { fontSize: 14, fontWeight: '700', color: WT.colors.textDark, marginBottom: WT.spacing.sm },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: WT.spacing.sm },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(140,92,196,0.08)',
        borderRadius: WT.radius.sm,
        paddingHorizontal: WT.spacing.md,
        color: WT.colors.textDark,
        fontSize: 15,
        fontWeight: '500',
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: WT.radius.sm,
        backgroundColor: WT.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: WT.colors.textMuted,
        letterSpacing: 1.2,
        marginBottom: WT.spacing.md,
    },
    exCard: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        padding: WT.spacing.md,
        marginBottom: WT.spacing.sm,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    exTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: WT.spacing.sm,
    },
    exName: { fontSize: 16, fontWeight: '700', color: WT.colors.textDark, flex: 1, marginRight: WT.spacing.sm },
    exFields: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(140,92,196,0.06)',
        borderRadius: WT.radius.sm,
        overflow: 'hidden',
    },
    fieldBox: { flex: 1, alignItems: 'center', paddingVertical: 8 },
    fieldLabel: { fontSize: 11, color: WT.colors.textMuted, marginBottom: 2 },
    fieldDivider: { width: 1, height: 36, backgroundColor: WT.colors.cardBorder },
    fieldInput: {
        fontSize: 18,
        fontWeight: '800',
        color: WT.colors.primary,
        textAlign: 'center',
        minWidth: 40,
    },
    emptyState: { alignItems: 'center', paddingVertical: 60, gap: WT.spacing.md },
    emptyEmoji: { fontSize: 48 },
    emptyText: { textAlign: 'center' },
});

export default CustomWorkoutScreen;
