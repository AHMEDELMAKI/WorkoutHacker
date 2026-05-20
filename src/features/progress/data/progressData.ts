// File: src/features/progress/data/progressData.ts
export interface WeeklyBar {
    day: string;
    value: number;   // 0–1
    volume: number;  // actual kg
}

export interface MonthlyPoint {
    week: string;
    strength: number;
    endurance: number;
    recovery: number;
}

export interface PersonalRecord {
    id: string;
    exercise: string;
    value: string;
    date: string;
    icon: string;
    color: string;
}

export const WEEKLY_BARS: WeeklyBar[] = [
    { day: 'Mon', value: 0.55, volume: 4800 },
    { day: 'Tue', value: 0.80, volume: 7200 },
    { day: 'Wed', value: 0.40, volume: 3600 },
    { day: 'Thu', value: 0.90, volume: 8100 },
    { day: 'Fri', value: 0.70, volume: 6300 },
    { day: 'Sat', value: 1.00, volume: 9000 },
    { day: 'Sun', value: 0.30, volume: 2700 },
];

export const MONTHLY_TREND: MonthlyPoint[] = [
    { week: 'W1', strength: 58, endurance: 45, recovery: 70 },
    { week: 'W2', strength: 63, endurance: 52, recovery: 72 },
    { week: 'W3', strength: 70, endurance: 60, recovery: 68 },
    { week: 'W4', strength: 78, endurance: 65, recovery: 75 },
];

export const PERSONAL_RECORDS: PersonalRecord[] = [
    { id: 'pr1', exercise: 'Bench Press', value: '100 kg', date: '3 days ago', icon: '🏋️', color: '#7C3AED' },
    { id: 'pr2', exercise: '5K Run', value: '24:18', date: 'Last week', icon: '🏃', color: '#0EA5E9' },
    { id: 'pr3', exercise: 'Deadlift', value: '140 kg', date: '2 weeks ago', icon: '⚡', color: '#F59E0B' },
    { id: 'pr4', exercise: 'Pull-ups', value: '18 reps', date: 'Yesterday', icon: '💪', color: '#10B981' },
];