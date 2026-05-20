// File: src/features/home/data/homeData.ts
export interface WorkoutCard {
    id: string;
    title: string;
    type: string;
    duration: number;   // minutes
    calories: number;
    difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Intense';
    muscleGroups: string[];
    accentColor: string;
}

export interface StatItem {
    id: string;
    label: string;
    value: string;
    unit: string;
    delta: string;
    deltaPositive: boolean;
    icon: string;
    color: string;
}

export interface RecentActivity {
    id: string;
    title: string;
    date: string;
    duration: number;
    calories: number;
    icon: string;
}

export const TODAYS_WORKOUT: WorkoutCard = {
    id: 'w1',
    title: 'Upper Body Power',
    type: 'Strength',
    duration: 48,
    calories: 390,
    difficulty: 'Moderate',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    accentColor: '#7C3AED',
};

export const WEEKLY_STATS: StatItem[] = [
    { id: 's1', label: 'Workouts', value: '4', unit: 'sessions', delta: '+1', deltaPositive: true, icon: '⚡', color: '#7C3AED' },
    { id: 's2', label: 'Volume', value: '12.4', unit: 'k kg', delta: '+8%', deltaPositive: true, icon: '🏋️', color: '#0EA5E9' },
    { id: 's3', label: 'Calories', value: '1,840', unit: 'kcal', delta: '-3%', deltaPositive: false, icon: '🔥', color: '#F59E0B' },
    { id: 's4', label: 'Streak', value: '6', unit: 'days', delta: '+2', deltaPositive: true, icon: '📅', color: '#10B981' },
];

export const RECENT_ACTIVITY: RecentActivity[] = [
    { id: 'a1', title: 'Leg Day', date: 'Yesterday', duration: 55, calories: 480, icon: '🦵' },
    { id: 'a2', title: 'Morning Run', date: 'Mon', duration: 32, calories: 290, icon: '🏃' },
    { id: 'a3', title: 'Core & Cardio', date: 'Sun', duration: 40, calories: 310, icon: '💪' },
];