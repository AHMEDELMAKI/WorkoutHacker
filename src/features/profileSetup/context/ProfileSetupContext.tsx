// File: src/features/profileSetup/context/ProfileSetupContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

export type Gender = 'male' | 'female' | 'other' | null;
export type Goal = 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'stay_healthy' | 'athletic_performance';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'athlete';

export interface ProfileSetupState {
    gender: Gender;
    age: number;
    weightKg: number;
    heightCm: number;
    goals: Goal[];
    fitnessLevel: FitnessLevel | null;
    privacyLocalOnly: boolean;
    privacyShareAnalytics: boolean;
    privacyCameraAccess: boolean;
}

interface ProfileSetupContextValue {
    profile: ProfileSetupState;
    setGender: (g: Gender) => void;
    setAge: (a: number) => void;
    setWeight: (w: number) => void;
    setHeight: (h: number) => void;
    toggleGoal: (g: Goal) => void;
    setFitnessLevel: (l: FitnessLevel) => void;
    setPrivacy: (key: keyof Pick<ProfileSetupState, 'privacyLocalOnly' | 'privacyShareAnalytics' | 'privacyCameraAccess'>, val: boolean) => void;
}

const DEFAULT_STATE: ProfileSetupState = {
    gender: null,
    age: 25,
    weightKg: 70,
    heightCm: 170,
    goals: [],
    fitnessLevel: null,
    privacyLocalOnly: true,
    privacyShareAnalytics: false,
    privacyCameraAccess: true,
};

const ProfileSetupContext = createContext<ProfileSetupContextValue | null>(null);

export const ProfileSetupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<ProfileSetupState>(DEFAULT_STATE);

    const setGender = useCallback((gender: Gender) => setProfile(p => ({ ...p, gender })), []);
    const setAge = useCallback((age: number) => setProfile(p => ({ ...p, age })), []);
    const setWeight = useCallback((weightKg: number) => setProfile(p => ({ ...p, weightKg })), []);
    const setHeight = useCallback((heightCm: number) => setProfile(p => ({ ...p, heightCm })), []);
    const setFitnessLevel = useCallback((fitnessLevel: FitnessLevel) => setProfile(p => ({ ...p, fitnessLevel })), []);

    const toggleGoal = useCallback((goal: Goal) =>
        setProfile(p => ({
            ...p,
            goals: p.goals.includes(goal)
                ? p.goals.filter(g => g !== goal)
                : [...p.goals, goal],
        })), []);

    const setPrivacy = useCallback(
        (key: keyof Pick<ProfileSetupState, 'privacyLocalOnly' | 'privacyShareAnalytics' | 'privacyCameraAccess'>, val: boolean) =>
            setProfile(p => ({ ...p, [key]: val })),
        [],
    );

    return (
        <ProfileSetupContext.Provider value={{ profile, setGender, setAge, setWeight, setHeight, toggleGoal, setFitnessLevel, setPrivacy }}>
            {children}
        </ProfileSetupContext.Provider>
    );
};

export const useProfileSetup = () => {
    const ctx = useContext(ProfileSetupContext);
    if (!ctx) throw new Error('useProfileSetup must be used inside ProfileSetupProvider');
    return ctx;
};