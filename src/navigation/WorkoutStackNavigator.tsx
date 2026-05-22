// src/navigation/WorkoutStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AbdominalWorkoutScreen from '../features/workout/screens/AbdominalWorkoutScreen';
import BicepWorkoutScreen from '../features/workout/screens/BicepWorkoutScreen';
import CalfWorkoutScreen from '../features/workout/screens/CalfWorkoutScreen';
import ChestWorkoutScreen from '../features/workout/screens/ChestWorkoutScreen';
import CustomWorkoutScreen from '../features/workout/screens/CustomWorkoutScreen';
import DeltoidWorkoutScreen from '../features/workout/screens/DeltoidWorkoutScreen';
import ExerciseDetailsScreen from '../features/workout/screens/ExerciseDetailsScreen';
import ForearmWorkoutScreen from '../features/workout/screens/ForearmWorkoutScreen';
import FullBodyWorkoutScreen from '../features/workout/screens/FullBodyWorkoutScreen';
import GhostGuideTestScreen from '../features/workout/screens/GhostGuideTestScreen';
import HeartRateFatigueScreen from '../features/workout/screens/HeartRateFatigueScreen';
import LatsWorkoutScreen from '../features/workout/screens/LatsWorkoutScreen';
import LowerWorkoutScreen from '../features/workout/screens/LowerWorkoutScreen';
import LumbarWorkoutScreen from '../features/workout/screens/LumbarWorkoutScreen';
import QuadWorkoutScreen from '../features/workout/screens/QuadWorkoutScreen';
import TempoClassifierTestScreen from '../features/workout/screens/TempoClassifierTestScreen';
import TrapeziusWorkoutScreen from '../features/workout/screens/TrapeziusWorkoutScreen';
import TricepWorkoutScreen from '../features/workout/screens/TricepWorkoutScreen';
import TrackingScreen from '../features/workout/screens/TrackingScreen';
import UpperWorkoutScreen from '../features/workout/screens/UpperWorkoutScreen';
import WorkoutCompleteScreen from '../features/workout/screens/WorkoutCompleteScreen';
import WorkoutPlannerTestScreen from '../features/workout/screens/WorkoutPlannerTestScreen';
import WorkoutSelectionScreen from '../features/workout/screens/WorkoutSelectionScreen';
import type { WorkoutStackParamList } from './types';

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

const WorkoutStackNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WorkoutSelection" component={WorkoutSelectionScreen} />

        <Stack.Screen name="FullBodyWorkout" component={FullBodyWorkoutScreen} />
        <Stack.Screen name="UpperWorkout" component={UpperWorkoutScreen} />
        <Stack.Screen name="LowerWorkout" component={LowerWorkoutScreen} />
        <Stack.Screen name="CustomWorkout" component={CustomWorkoutScreen} />

        <Stack.Screen name="DeltoidWorkout" component={DeltoidWorkoutScreen} />
        <Stack.Screen name="BicepWorkout" component={BicepWorkoutScreen} />
        <Stack.Screen name="TricepWorkout" component={TricepWorkoutScreen} />
        <Stack.Screen name="ForearmWorkout" component={ForearmWorkoutScreen} />
        <Stack.Screen name="ChestWorkout" component={ChestWorkoutScreen} />
        <Stack.Screen name="AbdominalWorkout" component={AbdominalWorkoutScreen} />
        <Stack.Screen name="LatsWorkout" component={LatsWorkoutScreen} />
        <Stack.Screen name="TrapeziusWorkout" component={TrapeziusWorkoutScreen} />
        <Stack.Screen name="LumbarWorkout" component={LumbarWorkoutScreen} />
        <Stack.Screen name="QuadWorkout" component={QuadWorkoutScreen} />
        <Stack.Screen name="CalfWorkout" component={CalfWorkoutScreen} />

        <Stack.Screen name="GhostGuideTest" component={GhostGuideTestScreen} />
        <Stack.Screen name="TempoClassifierTest" component={TempoClassifierTestScreen} />
        <Stack.Screen name="WorkoutPlannerTest" component={WorkoutPlannerTestScreen} />

        <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="HeartRateFatigue" component={HeartRateFatigueScreen} />
        <Stack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
    </Stack.Navigator>
);

export default WorkoutStackNavigator;
