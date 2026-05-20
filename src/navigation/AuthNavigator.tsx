import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import OTPVerificationScreen from '../features/auth/screens/OTPVerificationScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import ResetPasswordScreen from '../features/auth/screens/ResetPasswordScreen';
import SuccessScreen from '../features/auth/screens/SuccessScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#875BA4' },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
