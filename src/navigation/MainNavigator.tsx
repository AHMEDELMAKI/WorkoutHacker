import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import AICoachScreen from '../features/aiCoach/screens/AICoachScreen';
import HomeScreen from '../features/main/screens/HomeScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import ProgressStackNavigator from './ProgressStackNavigator';
import WorkoutStackNavigator from './WorkoutStackNavigator';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const BG = '#875BA4';
const ACTIVE = '#FFFFFF';
const INACTIVE = 'rgba(255,255,255,0.50)';

type TabIconName =
    | 'home' | 'home-outline'
    | 'barbell' | 'barbell-outline'
    | 'stats-chart' | 'stats-chart-outline'
    | 'sparkles' | 'sparkles-outline'
    | 'person' | 'person-outline';

const TAB_ICONS: Record<
    keyof MainTabParamList,
    { focused: TabIconName; unfocused: TabIconName }
> = {
    Home: { focused: 'home', unfocused: 'home-outline' },
    Workout: { focused: 'barbell', unfocused: 'barbell-outline' },
    ProgressStack: { focused: 'stats-chart', unfocused: 'stats-chart-outline' },
    AICoach: { focused: 'sparkles', unfocused: 'sparkles-outline' },
    ProfileStack: { focused: 'person', unfocused: 'person-outline' },
};

const MainNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: ACTIVE,
            tabBarInactiveTintColor: INACTIVE,
            tabBarStyle: {
                backgroundColor: BG,
                borderTopWidth: 0,
                paddingTop: 6,
                paddingBottom: 6,
                height: 64,
                elevation: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
            },
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                marginTop: 2,
            },
            tabBarIcon: ({ focused, color, size }) => {
                const icons = TAB_ICONS[route.name as keyof MainTabParamList];
                const iconName = focused ? icons.focused : icons.unfocused;
                return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}
    >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="Workout" component={WorkoutStackNavigator} options={{ tabBarLabel: 'Workout' }} />
        <Tab.Screen name="ProgressStack" component={ProgressStackNavigator} options={{ tabBarLabel: 'Progress' }} />
        <Tab.Screen name="AICoach" component={AICoachScreen} options={{ tabBarLabel: 'AI Coach' }} />
        <Tab.Screen name="ProfileStack" component={ProfileStackNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
);

export default MainNavigator;
