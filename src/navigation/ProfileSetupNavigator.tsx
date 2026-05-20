import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ProfileSetupProvider } from '../features/profileSetup/context/ProfileSetupContext';
import { ProfileSetupStackParamList } from './types';

// Screens
import AgePickerScreen from '../features/profileSetup/screens/AgePickerScreen';
import FitnessLevelScreen from '../features/profileSetup/screens/FitnessLevelScreen';
import GenderSelectionScreen from '../features/profileSetup/screens/GenderSelectionScreen';
import GoalSelectionScreen from '../features/profileSetup/screens/GoalSelectionScreen';
import HeightPickerScreen from '../features/profileSetup/screens/HeightPickerScreen';
import SetupReviewScreen from '../features/profileSetup/screens/SetupReviewScreen';
import WeightPickerScreen from '../features/profileSetup/screens/WeightPickerScreen';

const Stack = createNativeStackNavigator<ProfileSetupStackParamList>();

const ProfileSetupNavigator = () => {
    return (
        <ProfileSetupProvider>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#875BA4' },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Gender" component={GenderSelectionScreen} />
                <Stack.Screen name="Age" component={AgePickerScreen} />
                <Stack.Screen name="Height" component={HeightPickerScreen} />
                <Stack.Screen name="Weight" component={WeightPickerScreen} />
                <Stack.Screen name="Goals" component={GoalSelectionScreen} />
                <Stack.Screen name="FitnessLevel" component={FitnessLevelScreen} />
                <Stack.Screen name="SetupComplete" component={SetupReviewScreen} />
            </Stack.Navigator>
        </ProfileSetupProvider>
    );
};

export default ProfileSetupNavigator;
