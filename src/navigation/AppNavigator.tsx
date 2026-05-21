import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import GlobalVoiceController from '../components/GlobalVoiceController';
import { navigationRef } from '../services/navigationService';
import AuthNavigator from './AuthNavigator';
import FatigueCheckNavigator from './FatigueCheckNavigator';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import ProfileSetupNavigator from './ProfileSetupNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const user = useAuthStore(s => s.user);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const isGuest = useAuthStore(s => s.isGuest);
    const isInitialized = useAuthStore(s => s.isInitialized);


    if (!isInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A0E2A' }}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <GlobalVoiceController />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated && !isGuest ? (
                    // 1. Not Authenticated (and not guest): Onboarding -> Auth
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                        <Stack.Screen name="Auth" component={AuthNavigator} />
                    </>
                ) : !isGuest && !user?.onboardingDone ? (
                    // 2. Authenticated but Onboarding not done (guest bypasses this)
                    <Stack.Screen name="ProfileSetup" component={ProfileSetupNavigator} />
                ) : (
                    // 3. Fully ready or guest landing
                    <>
                        <Stack.Screen name="Main" component={MainNavigator} />
                        <Stack.Screen name="FatigueCheck" component={FatigueCheckNavigator} />
                    </>
                )}

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
