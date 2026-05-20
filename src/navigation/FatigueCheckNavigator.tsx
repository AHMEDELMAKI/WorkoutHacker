import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { FatigueCheckProvider } from '../features/fatigue/context/FatigueCheckContext';
import FatigueHeartRateScreen from '../features/fatigue/screens/FatigueHeartRateScreen';
import FatigueLandingScreen from '../features/fatigue/screens/FatigueLandingScreen';
import FatigueProcessingScreen from '../features/fatigue/screens/FatigueProcessingScreen';
import FatigueResultsScreen from '../features/fatigue/screens/FatigueResultsScreen';
import type { FatigueCheckStackParamList } from './types';

const Stack = createNativeStackNavigator<FatigueCheckStackParamList>();

const FatigueCheckNavigator = () => (
  <FatigueCheckProvider>
    <Stack.Navigator
      initialRouteName="FatigueLanding"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FatigueLanding" component={FatigueLandingScreen} />
      <Stack.Screen name="FatigueHeartRate" component={FatigueHeartRateScreen} />
      <Stack.Screen name="FatigueProcessing" component={FatigueProcessingScreen} />
      <Stack.Screen name="FatigueResults" component={FatigueResultsScreen} />
    </Stack.Navigator>
  </FatigueCheckProvider>
);

export default FatigueCheckNavigator;
