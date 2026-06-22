import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AICoachScreen from '../features/aiCoach/screens/AICoachScreen';
import WorkoutPlannerScreen from '../features/aiCoach/screens/WorkoutPlannerScreen';
import NutritionPlannerScreen from '../features/nutrition/screens/NutritionPlannerScreen';
import { AICoachStackParamList } from './types';

const Stack = createNativeStackNavigator<AICoachStackParamList>();

const AICoachStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AICoachHome" component={AICoachScreen} />
            <Stack.Screen name="WorkoutPlanner" component={WorkoutPlannerScreen} />
            <Stack.Screen name="NutritionPlanner" component={NutritionPlannerScreen} />
        </Stack.Navigator>
    );
};

export default AICoachStackNavigator;
