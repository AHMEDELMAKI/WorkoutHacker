import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generatePlan, WorkoutRequest } from '../../../lib/workout-planner';
import AppButton from '../../../components/AppButton';
import AppInput from '../../../components/AppInput';
import { useAuthStore } from '../../../store/authStore';

const WorkoutPlannerScreen = () => {
  const [request, setRequest] = useState<Partial<WorkoutRequest>>({
    daysPerWeek: 3,
    primaryGoal: 'hypertrophy',
    trainingLevel: 'beginner',
  });
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setGeneratedPlan(null);
    try {
      const apiBaseUrl = 'http://localhost:4000';
      const plan = await generatePlan(
        { apiBaseUrl },
        request as WorkoutRequest,
      );
      setGeneratedPlan(plan);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Error Generating Plan', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>AI Workout Planner</Text>
        <AppInput
          label="Primary Goal"
          value={request.primaryGoal}
          onChangeText={(text) => setRequest({ ...request, primaryGoal: text })}
        />
        <AppInput
          label="Training Level"
          value={request.trainingLevel}
          onChangeText={(text) => setRequest({ ...request, trainingLevel: text as any })}
        />
        <AppInput
          label="Days Per Week"
          value={request.daysPerWeek?.toString()}
          onChangeText={(text) => setRequest({ ...request, daysPerWeek: parseInt(text) || 0 })}
          keyboardType="numeric"
        />
        <AppButton title="Generate Plan" onPress={handleGeneratePlan} loading={loading} />

        {generatedPlan && (
          <View style={styles.planContainer}>
            <Text style={styles.planTitle}>{generatedPlan.planName}</Text>
            <Text style={styles.planRationale}>{generatedPlan.rationale}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  planContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planRationale: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default WorkoutPlannerScreen;
