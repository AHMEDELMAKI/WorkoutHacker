import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AICoachScreen from '../features/aiCoach/screens/AICoachScreen';
import WorkoutPlannerTestScreen from '../features/workout/screens/WorkoutPlannerTestScreen';
import { AICoachStackParamList } from './types';
import { ACT } from '../features/aiCoach/components/AICoachTheme';

const Stack = createNativeStackNavigator<AICoachStackParamList>();

const AICoachStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: ACT.bgPrimary },
            }}
        >
            <Stack.Screen
                name="AICoachMain"
                component={AICoachScreen}
                options={{ title: 'AI Coach' }}
            />
            <Stack.Screen
                name="WorkoutPlanner"
                component={WorkoutPlannerTestScreen}
                options={{
                    title: 'Workout Planner',
                    headerShown: true,
                    headerStyle: { backgroundColor: ACT.bgPrimary },
                    headerTintColor: ACT.textWhite,
                    headerTitleStyle: { fontWeight: '700' },
                }}
            />
        </Stack.Navigator>
    );
};

export default AICoachStackNavigator;