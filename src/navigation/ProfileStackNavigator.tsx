// src/navigation/ProfileStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AboutAppScreen from '../features/profile/screens/AboutAppScreen';
import HelpScreen from '../features/profile/screens/HelpScreen';
import PrivacySettingsScreen from '../features/profile/screens/PrivacySettingsScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileHome" component={ProfileScreen} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="AboutApp" component={AboutAppScreen} />
    </Stack.Navigator>
);

export default ProfileStackNavigator;
