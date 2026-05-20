// src/features/workout/data/workoutData.ts

export interface ExerciseType {
    id: string;
    name: string;
    targetMuscles: string;
    sets: string;
    reps: string;
    tips: string[];
    emoji: string;
}

export interface WorkoutCategory {
    id: string;
    title: string;
    duration: string;
    exerciseCount: number;
    emoji: string;
    accentColor: string;
    route: 'FullBodyWorkout' | 'UpperWorkout' | 'LowerWorkout' | 'CustomWorkout';
}

export const workoutCategories: WorkoutCategory[] = [
    {
        id: 'full',
        title: 'Full Body',
        duration: '45 min',
        exerciseCount: 6,
        emoji: '🏋️',
        accentColor: '#8C5CC4',
        route: 'FullBodyWorkout',
    },
    {
        id: 'upper',
        title: 'Upper Body',
        duration: '35 min',
        exerciseCount: 5,
        emoji: '💪',
        accentColor: '#5C8CC4',
        route: 'UpperWorkout',
    },
    {
        id: 'lower',
        title: 'Lower Body',
        duration: '40 min',
        exerciseCount: 5,
        emoji: '🦵',
        accentColor: '#C45C8C',
        route: 'LowerWorkout',
    },
    {
        id: 'custom',
        title: 'Custom',
        duration: 'Your pace',
        exerciseCount: 0,
        emoji: '✏️',
        accentColor: '#5CC48C',
        route: 'CustomWorkout',
    },
];

export const fullBodyExercises: ExerciseType[] = [
    {
        id: 'fb1',
        name: 'Burpees',
        targetMuscles: 'Full Body',
        sets: '3',
        reps: '10',
        emoji: '🔥',
        tips: [
            'Keep your core tight throughout the movement.',
            'Land softly to protect your knees.',
            'Control the descent in the push-up phase.',
        ],
    },
    {
        id: 'fb2',
        name: 'Jump Squats',
        targetMuscles: 'Quads, Glutes, Calves',
        sets: '3',
        reps: '12',
        emoji: '⬆️',
        tips: [
            'Push through the full foot on the way up.',
            'Absorb impact by landing with soft knees.',
            'Keep chest upright during the squat portion.',
        ],
    },
    {
        id: 'fb3',
        name: 'Push-Ups',
        targetMuscles: 'Chest, Triceps, Shoulders',
        sets: '4',
        reps: '15',
        emoji: '💪',
        tips: [
            'Maintain a plank-like body position.',
            'Keep elbows at a 45° angle from your torso.',
            'Lower chest all the way to the floor.',
        ],
    },
    {
        id: 'fb4',
        name: 'Mountain Climbers',
        targetMuscles: 'Core, Shoulders, Hip Flexors',
        sets: '3',
        reps: '20',
        emoji: '🏔️',
        tips: [
            'Keep hips level with your shoulders.',
            'Drive knees towards your chest explosively.',
            'Maintain a steady breathing rhythm.',
        ],
    },
    {
        id: 'fb5',
        name: 'Plank',
        targetMuscles: 'Core, Back, Shoulders',
        sets: '3',
        reps: '45 sec',
        emoji: '🧘',
        tips: [
            'Squeeze your glutes and abs throughout.',
            'Keep your body in a straight line.',
            'Breathe in through nose, out through mouth.',
        ],
    },
    {
        id: 'fb6',
        name: 'High Knees',
        targetMuscles: 'Core, Hip Flexors, Calves',
        sets: '3',
        reps: '30 sec',
        emoji: '🏃',
        tips: [
            'Drive knees above hip height.',
            'Pump arms in sync with legs.',
            'Stay on the balls of your feet.',
        ],
    },
];

export const upperBodyExercises: ExerciseType[] = [
    {
        id: 'ub1',
        name: 'Pike Push-Ups',
        targetMuscles: 'Shoulders, Triceps',
        sets: '3',
        reps: '12',
        emoji: '🔺',
        tips: [
            'Form an inverted V with your body.',
            'Lower head between your hands slowly.',
            'Press back up without moving your feet.',
        ],
    },
    {
        id: 'ub2',
        name: 'Diamond Push-Ups',
        targetMuscles: 'Triceps, Inner Chest',
        sets: '3',
        reps: '10',
        emoji: '💎',
        tips: [
            'Place hands close together forming a diamond shape.',
            'Keep elbows tucked tight to your sides.',
            'Control the lowering phase for 2 seconds.',
        ],
    },
    {
        id: 'ub3',
        name: 'Wide Push-Ups',
        targetMuscles: 'Chest, Front Deltoids',
        sets: '4',
        reps: '15',
        emoji: '↔️',
        tips: [
            'Place hands wider than shoulder width.',
            'Feel the stretch in your chest at the bottom.',
            'Exhale as you push up explosively.',
        ],
    },
    {
        id: 'ub4',
        name: 'Tricep Dips',
        targetMuscles: 'Triceps, Chest',
        sets: '3',
        reps: '12',
        emoji: '⬇️',
        tips: [
            'Keep your back close to the surface.',
            'Lower until elbows reach 90°.',
            'Do not lock elbows at the top.',
        ],
    },
    {
        id: 'ub5',
        name: 'Arm Circles',
        targetMuscles: 'Shoulder Rotator Cuff',
        sets: '2',
        reps: '20 each dir',
        emoji: '⭕',
        tips: [
            'Keep arms fully extended throughout.',
            'Move slowly for full range of motion.',
            'Switch directions after each set.',
        ],
    },
];

export const lowerBodyExercises: ExerciseType[] = [
    {
        id: 'lb1',
        name: 'Squats',
        targetMuscles: 'Quads, Glutes, Hamstrings',
        sets: '4',
        reps: '15',
        emoji: '🏋️',
        tips: [
            'Keep feet shoulder-width apart.',
            'Drive knees out — do not let them cave.',
            'Break parallel for full glute activation.',
        ],
    },
    {
        id: 'lb2',
        name: 'Lunges',
        targetMuscles: 'Quads, Glutes, Balance',
        sets: '3',
        reps: '12 each leg',
        emoji: '🚶',
        tips: [
            'Front knee should not pass your toes.',
            'Lower back knee to just above the floor.',
            'Keep torso upright and core engaged.',
        ],
    },
    {
        id: 'lb3',
        name: 'Glute Bridges',
        targetMuscles: 'Glutes, Hamstrings, Core',
        sets: '3',
        reps: '15',
        emoji: '🌉',
        tips: [
            'Drive through your heels to lift hips.',
            'Squeeze glutes hard at the top.',
            'Hold 1 second at the peak for intensity.',
        ],
    },
    {
        id: 'lb4',
        name: 'Calf Raises',
        targetMuscles: 'Gastrocnemius, Soleus',
        sets: '4',
        reps: '20',
        emoji: '⬆️',
        tips: [
            'Rise up as high as possible on your toes.',
            'Lower slowly for eccentric benefit.',
            'Use a wall for balance if needed.',
        ],
    },
    {
        id: 'lb5',
        name: 'Wall Sit',
        targetMuscles: 'Quads, Glutes, Core',
        sets: '3',
        reps: '45 sec',
        emoji: '🧱',
        tips: [
            'Thighs parallel to the floor.',
            'Keep back flat against the wall.',
            'Breathe steadily — do not hold your breath.',
        ],
    },
];
