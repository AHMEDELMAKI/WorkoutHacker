import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generatePlan, WorkoutRequest } from '../../../lib/workout-planner';

const WorkoutPlannerSimple = () => {
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        try {
            setLoading(true);
            const request: WorkoutRequest = {
                daysPerWeek: 3,
                primaryGoal: 'strength',
                trainingLevel: 'beginner',
                equipmentAvailable: ['barbell', 'dumbbell'],
            };
            const result = await generatePlan({ apiBaseUrl: 'http://localhost:3000' }, request);
            setPlan(result);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Simple AI Workout Planner</Text>
                {/* Simple UI implementation */}
                <View style={styles.card}>
                   <Text>This is the basic workout planner interface.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', margin: 16 },
    card: { padding: 16, margin: 16, backgroundColor: '#f0f0f0', borderRadius: 8 },
});

export default WorkoutPlannerSimple;
