// src/navigation/ProgressStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ProgressScreen from '../features/progress/screens/ProgressScreen';
import WorkoutSummaryScreen from '../features/progress/screens/WorkoutSummaryScreen';
import type { ProgressStackParamList } from './types';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

const ProgressStackNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProgressHome" component={ProgressScreen} />
        <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
    </Stack.Navigator>
);

export default ProgressStackNavigator;
