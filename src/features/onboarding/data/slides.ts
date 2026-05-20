// File: src/features/onboarding/data/slides.ts

import {
    onboardingAiCoach,
    onboardingTrainSmarter,
    onboardingPrivacy,
    onboardingGetStarted,
} from '../../../assets/images';

export interface OnboardingSlide {
    id: string;
    title: string;
    subtitle?: string;
    image: any;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
    {
        id: 'ai-coach',
        title: 'Your Personal AI Coach',
        subtitle: 'Real-time feedback, Rep counting and Form correction',
        image: onboardingAiCoach,
    },
    {
        id: 'train-smarter',
        title: 'Train Smarter',
        subtitle: 'Fatigue detection, Form quality score and Personalized workouts',
        image: onboardingTrainSmarter,
    },
    {
        id: 'privacy',
        title: 'Your Data, Your Control',
        subtitle: 'Local data processing, Camera is optional and No forced cloud',
        image: onboardingPrivacy,
    },
    {
        id: 'get-started',
        title: 'Ready to start your journey',
        subtitle: '',
        image: onboardingGetStarted,
    },
];