import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import OnboardingSlidesScreen from '../features/onboarding/screens/OnboardingSlidesScreen';
import SplashScreen from '../features/onboarding/screens/SplashScreen';
import WelcomeScreen from '../features/onboarding/screens/WelcomeScreen';
import { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="OnboardingSlides" component={OnboardingSlidesScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
        </Stack.Navigator>
    );
};

export default OnboardingNavigator;
