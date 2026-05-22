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
    route:
        | 'FullBodyWorkout'
        | 'UpperWorkout'
        | 'LowerWorkout'
        | 'CustomWorkout'
        // Muscle group workouts
        | 'DeltoidWorkout'
        | 'BicepWorkout'
        | 'TricepWorkout'
        | 'ForearmWorkout'
        | 'ChestWorkout'
        | 'AbdominalWorkout'
        | 'LatsWorkout'
        | 'TrapeziusWorkout'
        | 'LumbarWorkout'
        | 'QuadWorkout'
        | 'CalfWorkout';
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

    // Muscle group categories
    {
        id: 'deltoid',
        title: 'Deltoid',
        duration: '25-35 min',
        exerciseCount: 6,
        emoji: '🤸‍♂️',
        accentColor: '#8C5CC4',
        route: 'DeltoidWorkout',
    },
    {
        id: 'bicep',
        title: 'Bicep',
        duration: '25-35 min',
        exerciseCount: 5,
        emoji: '💪',
        accentColor: '#5C8CC4',
        route: 'BicepWorkout',
    },
    {
        id: 'tricep',
        title: 'Tricep',
        duration: '25-35 min',
        exerciseCount: 5,
        emoji: '🦾',
        accentColor: '#C45C8C',
        route: 'TricepWorkout',
    },
    {
        id: 'forearm',
        title: 'Forearm',
        duration: '20-30 min',
        exerciseCount: 5,
        emoji: '🤝',
        accentColor: '#28C4A6',
        route: 'ForearmWorkout',
    },
    {
        id: 'chest',
        title: 'Chest',
        duration: '25-35 min',
        exerciseCount: 5,
        emoji: '🫀',
        accentColor: '#FF7A59',
        route: 'ChestWorkout',
    },
    {
        id: 'abdominal',
        title: 'Abdominal',
        duration: '20-30 min',
        exerciseCount: 5,
        emoji: '🧱',
        accentColor: '#7C5CFF',
        route: 'AbdominalWorkout',
    },
    {
        id: 'lats',
        title: 'Lats',
        duration: '25-35 min',
        exerciseCount: 5,
        emoji: '🪽',
        accentColor: '#5CC48C',
        route: 'LatsWorkout',
    },
    {
        id: 'trapezius',
        title: 'Trapezius',
        duration: '20-30 min',
        exerciseCount: 4,
        emoji: '🧠',
        accentColor: '#8C5CC4',
        route: 'TrapeziusWorkout',
    },
    {
        id: 'lumbar',
        title: 'Lumbar',
        duration: '25-35 min',
        exerciseCount: 4,
        emoji: '🧘',
        accentColor: '#5C8CC4',
        route: 'LumbarWorkout',
    },
    {
        id: 'quad',
        title: 'Quad',
        duration: '25-40 min',
        exerciseCount: 5,
        emoji: '🦵',
        accentColor: '#C45C8C',
        route: 'QuadWorkout',
    },
    {
        id: 'calf',
        title: 'Calf',
        duration: '20-30 min',
        exerciseCount: 5,
        emoji: '⚡',
        accentColor: '#28C4A6',
        route: 'CalfWorkout',
    },

    // Custom last
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
        emoji: '�',
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
        emoji: '�',
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
        emoji: '�',
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

// ---- Muscle-group workouts (new) ----
type MuscleGroupName =
    | 'Deltoid'
    | 'Bicep'
    | 'Tricep'
    | 'Forearm'
    | 'Chest'
    | 'Abdominal'
    | 'Lats'
    | 'Trapezius'
    | 'Lumbar'
    | 'Quad'
    | 'Calf';

const muscleTips = (muscle: MuscleGroupName, name: string): string[] => {
    const base = [
        `Focus on ${muscle} during the movement.`,
        'Move with controlled form; stop if pain occurs.',
        'Maintain steady breathing.',
    ];
    if (/(plank|hold|hang|bird dog)/i.test(name)) {
        return [
            ...base,
            'Keep your body braced and hold steady.',
        ];
    }
    return base;
};

const muscleEmoji = ''; // per request: do not use emojis

const holdReps = (name: string) =>
    /(plank|hold|hang|bird dog|tap|superman hold)/i.test(name) ? '30 sec' : '10';

export const deltoidExercises: ExerciseType[] = [
    {
        id: 'd1',
        name: 'Push-Up',
        targetMuscles: 'Deltoid',
        sets: '3',
        reps: holdReps('Push-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Deltoid', 'Push-Up'),
    },
    {
        id: 'd2',
        name: 'Pike Push-Up',
        targetMuscles: 'Deltoid',
        sets: '3',
        reps: holdReps('Pike Push-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Deltoid', 'Pike Push-Up'),
    },
    {
        id: 'd3',
        name: 'Dumbbell Shoulder Press',
        targetMuscles: 'Deltoid',
        sets: '3',
        reps: holdReps('Dumbbell Shoulder Press'),
        emoji: muscleEmoji,
        tips: muscleTips('Deltoid', 'Dumbbell Shoulder Press'),
    },
    {
        id: 'd4',
        name: 'Dumbbell Lateral Raise',
        targetMuscles: 'Deltoid',
        sets: '3',
        reps: holdReps('Dumbbell Lateral Raise'),
        emoji: muscleEmoji,
        tips: muscleTips('Deltoid', 'Dumbbell Lateral Raise'),
    },
    {
        id: 'd5',
        name: 'Cable Shoulder Press',
        targetMuscles: 'Deltoid',
        sets: '3',
        reps: holdReps('Cable Shoulder Press'),
        emoji: muscleEmoji,
        tips: muscleTips('Deltoid', 'Cable Shoulder Press'),
    },
    {
        id: 'd6',
        name: 'Face Pull',
        targetMuscles: 'Deltoid',
        sets: '3',
        reps: holdReps('Face Pull'),
        emoji: muscleEmoji,
        tips: muscleTips('Deltoid', 'Face Pull'),
    },
];

export const bicepExercises: ExerciseType[] = [
    {
        id: 'b1',
        name: 'Chin-Up',
        targetMuscles: 'Bicep',
        sets: '3',
        reps: holdReps('Chin-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Bicep', 'Chin-Up'),
    },
    {
        id: 'b2',
        name: 'Underhand Pull-Up',
        targetMuscles: 'Bicep',
        sets: '3',
        reps: holdReps('Underhand Pull-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Bicep', 'Underhand Pull-Up'),
    },
    {
        id: 'b3',
        name: 'Dumbbell Curl',
        targetMuscles: 'Bicep',
        sets: '3',
        reps: holdReps('Dumbbell Curl'),
        emoji: muscleEmoji,
        tips: muscleTips('Bicep', 'Dumbbell Curl'),
    },
    {
        id: 'b4',
        name: 'Hammer Curl',
        targetMuscles: 'Bicep',
        sets: '3',
        reps: holdReps('Hammer Curl'),
        emoji: muscleEmoji,
        tips: muscleTips('Bicep', 'Hammer Curl'),
    },
    {
        id: 'b5',
        name: 'Rope Cable Curl',
        targetMuscles: 'Bicep',
        sets: '3',
        reps: holdReps('Rope Cable Curl'),
        emoji: muscleEmoji,
        tips: muscleTips('Bicep', 'Rope Cable Curl'),
    },
];

export const tricepExercises: ExerciseType[] = [
    {
        id: 't1',
        name: 'Bench Dip',
        targetMuscles: 'Tricep',
        sets: '3',
        reps: holdReps('Bench Dip'),
        emoji: muscleEmoji,
        tips: muscleTips('Tricep', 'Bench Dip'),
    },
    {
        id: 't2',
        name: 'Diamond Push-Up',
        targetMuscles: 'Tricep',
        sets: '3',
        reps: holdReps('Diamond Push-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Tricep', 'Diamond Push-Up'),
    },
    {
        id: 't3',
        name: 'Dumbbell Overhead Extension',
        targetMuscles: 'Tricep',
        sets: '3',
        reps: holdReps('Dumbbell Overhead Extension'),
        emoji: muscleEmoji,
        tips: muscleTips('Tricep', 'Dumbbell Overhead Extension'),
    },
    {
        id: 't4',
        name: 'Dumbbell Kickback',
        targetMuscles: 'Tricep',
        sets: '3',
        reps: holdReps('Dumbbell Kickback'),
        emoji: muscleEmoji,
        tips: muscleTips('Tricep', 'Dumbbell Kickback'),
    },
    {
        id: 't5',
        name: 'Rope Pushdown',
        targetMuscles: 'Tricep',
        sets: '3',
        reps: holdReps('Rope Pushdown'),
        emoji: muscleEmoji,
        tips: muscleTips('Tricep', 'Rope Pushdown'),
    },
];

export const forearmExercises: ExerciseType[] = [
    {
        id: 'f1',
        name: 'Dead Hang',
        targetMuscles: 'Forearm',
        sets: '3',
        reps: holdReps('Dead Hang'),
        emoji: muscleEmoji,
        tips: muscleTips('Forearm', 'Dead Hang'),
    },
    {
        id: 'f2',
        name: 'Fingertip Plank',
        targetMuscles: 'Forearm',
        sets: '3',
        reps: holdReps('Fingertip Plank'),
        emoji: muscleEmoji,
        tips: muscleTips('Forearm', 'Fingertip Plank'),
    },
    {
        id: 'f3',
        name: 'Dumbbell Wrist Curl',
        targetMuscles: 'Forearm',
        sets: '3',
        reps: holdReps('Dumbbell Wrist Curl'),
        emoji: muscleEmoji,
        tips: muscleTips('Forearm', 'Dumbbell Wrist Curl'),
    },
    {
        id: 'f4',
        name: 'Reverse Dumbbell Curl',
        targetMuscles: 'Forearm',
        sets: '3',
        reps: holdReps('Reverse Dumbbell Curl'),
        emoji: muscleEmoji,
        tips: muscleTips('Forearm', 'Reverse Dumbbell Curl'),
    },
    {
        id: 'f5',
        name: 'Rope Hammer Curl',
        targetMuscles: 'Forearm',
        sets: '3',
        reps: holdReps('Rope Hammer Curl'),
        emoji: muscleEmoji,
        tips: muscleTips('Forearm', 'Rope Hammer Curl'),
    },
];

export const chestExercises: ExerciseType[] = [
    {
        id: 'c1',
        name: 'Push-Up',
        targetMuscles: 'Chest',
        sets: '3',
        reps: holdReps('Push-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Chest', 'Push-Up'),
    },
    {
        id: 'c2',
        name: 'Wide Push-Up',
        targetMuscles: 'Chest',
        sets: '3',
        reps: holdReps('Wide Push-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Chest', 'Wide Push-Up'),
    },
    {
        id: 'c3',
        name: 'Flat Dumbbell Bench Press',
        targetMuscles: 'Chest',
        sets: '3',
        reps: holdReps('Flat Dumbbell Bench Press'),
        emoji: muscleEmoji,
        tips: muscleTips('Chest', 'Flat Dumbbell Bench Press'),
    },
    {
        id: 'c4',
        name: 'Dumbbell Fly',
        targetMuscles: 'Chest',
        sets: '3',
        reps: holdReps('Dumbbell Fly'),
        emoji: muscleEmoji,
        tips: muscleTips('Chest', 'Dumbbell Fly'),
    },
    {
        id: 'c5',
        name: 'Cable Fly',
        targetMuscles: 'Chest',
        sets: '3',
        reps: holdReps('Cable Fly'),
        emoji: muscleEmoji,
        tips: muscleTips('Chest', 'Cable Fly'),
    },
];

export const abdominalExercises: ExerciseType[] = [
    {
        id: 'a1',
        name: 'Crunch',
        targetMuscles: 'Abdominal',
        sets: '3',
        reps: holdReps('Crunch'),
        emoji: muscleEmoji,
        tips: muscleTips('Abdominal', 'Crunch'),
    },
    {
        id: 'a2',
        name: 'Plank',
        targetMuscles: 'Abdominal',
        sets: '3',
        reps: holdReps('Plank'),
        emoji: muscleEmoji,
        tips: muscleTips('Abdominal', 'Plank'),
    },
    {
        id: 'a3',
        name: 'Weighted Crunch',
        targetMuscles: 'Abdominal',
        sets: '3',
        reps: holdReps('Weighted Crunch'),
        emoji: muscleEmoji,
        tips: muscleTips('Abdominal', 'Weighted Crunch'),
    },
    {
        id: 'a4',
        name: 'Dumbbell Side Bend',
        targetMuscles: 'Abdominal',
        sets: '3',
        reps: holdReps('Dumbbell Side Bend'),
        emoji: muscleEmoji,
        tips: muscleTips('Abdominal', 'Dumbbell Side Bend'),
    },
    {
        id: 'a5',
        name: 'Cable Woodchopper',
        targetMuscles: 'Abdominal',
        sets: '3',
        reps: holdReps('Cable Woodchopper'),
        emoji: muscleEmoji,
        tips: muscleTips('Abdominal', 'Cable Woodchopper'),
    },
];

export const latsExercises: ExerciseType[] = [
    {
        id: 'l1',
        name: 'Pull-Up',
        targetMuscles: 'Lats',
        sets: '3',
        reps: holdReps('Pull-Up'),
        emoji: muscleEmoji,
        tips: muscleTips('Lats', 'Pull-Up'),
    },
    {
        id: 'l2',
        name: 'Inverted Row',
        targetMuscles: 'Lats',
        sets: '3',
        reps: holdReps('Inverted Row'),
        emoji: muscleEmoji,
        tips: muscleTips('Lats', 'Inverted Row'),
    },
    {
        id: 'l3',
        name: 'Dumbbell Row',
        targetMuscles: 'Lats',
        sets: '3',
        reps: holdReps('Dumbbell Row'),
        emoji: muscleEmoji,
        tips: muscleTips('Lats', 'Dumbbell Row'),
    },
    {
        id: 'l4',
        name: 'One-Arm Dumbbell Row',
        targetMuscles: 'Lats',
        sets: '3',
        reps: holdReps('One-Arm Dumbbell Row'),
        emoji: muscleEmoji,
        tips: muscleTips('Lats', 'One-Arm Dumbbell Row'),
    },
    {
        id: 'l5',
        name: 'Lat Pulldown',
        targetMuscles: 'Lats',
        sets: '3',
        reps: holdReps('Lat Pulldown'),
        emoji: muscleEmoji,
        tips: muscleTips('Lats', 'Lat Pulldown'),
    },
];

export const trapeziusExercises: ExerciseType[] = [
    {
        id: 'z1',
        name: 'Dead Hang',
        targetMuscles: 'Trapezius',
        sets: '3',
        reps: holdReps('Dead Hang'),
        emoji: muscleEmoji,
        tips: muscleTips('Trapezius', 'Dead Hang'),
    },
    {
        id: 'z2',
        name: 'Plank Shoulder Tap',
        targetMuscles: 'Trapezius',
        sets: '3',
        reps: holdReps('Plank Shoulder Tap'),
        emoji: muscleEmoji,
        tips: muscleTips('Trapezius', 'Plank Shoulder Tap'),
    },
    {
        id: 'z3',
        name: 'Dumbbell Shrug',
        targetMuscles: 'Trapezius',
        sets: '3',
        reps: holdReps('Dumbbell Shrug'),
        emoji: muscleEmoji,
        tips: muscleTips('Trapezius', 'Dumbbell Shrug'),
    },
    {
        id: 'z4',
        name: 'Cable Shrug',
        targetMuscles: 'Trapezius',
        sets: '3',
        reps: holdReps('Cable Shrug'),
        emoji: muscleEmoji,
        tips: muscleTips('Trapezius', 'Cable Shrug'),
    },
];

export const lumbarExercises: ExerciseType[] = [
    {
        id: 'u1',
        name: 'Superman Hold',
        targetMuscles: 'Lumbar',
        sets: '3',
        reps: holdReps('Superman Hold'),
        emoji: muscleEmoji,
        tips: muscleTips('Lumbar', 'Superman Hold'),
    },
    {
        id: 'u2',
        name: 'Bird Dog',
        targetMuscles: 'Lumbar',
        sets: '3',
        reps: holdReps('Bird Dog'),
        emoji: muscleEmoji,
        tips: muscleTips('Lumbar', 'Bird Dog'),
    },
    {
        id: 'u3',
        name: 'Good Morning',
        targetMuscles: 'Lumbar',
        sets: '3',
        reps: holdReps('Good Morning'),
        emoji: muscleEmoji,
        tips: muscleTips('Lumbar', 'Good Morning'),
    },
    {
        id: 'u4',
        name: 'Cable Pull Through',
        targetMuscles: 'Lumbar',
        sets: '3',
        reps: holdReps('Cable Pull Through'),
        emoji: muscleEmoji,
        tips: muscleTips('Lumbar', 'Cable Pull Through'),
    },
];

export const quadExercises: ExerciseType[] = [
    {
        id: 'q1',
        name: 'Air Squat',
        targetMuscles: 'Quad',
        sets: '3',
        reps: holdReps('Air Squat'),
        emoji: muscleEmoji,
        tips: muscleTips('Quad', 'Air Squat'),
    },
    {
        id: 'q2',
        name: 'Forward Lunge',
        targetMuscles: 'Quad',
        sets: '3',
        reps: holdReps('Forward Lunge'),
        emoji: muscleEmoji,
        tips: muscleTips('Quad', 'Forward Lunge'),
    },
    {
        id: 'q3',
        name: 'Goblet Squat',
        targetMuscles: 'Quad',
        sets: '3',
        reps: holdReps('Goblet Squat'),
        emoji: muscleEmoji,
        tips: muscleTips('Quad', 'Goblet Squat'),
    },
    {
        id: 'q4',
        name: 'Cable Squat',
        targetMuscles: 'Quad',
        sets: '3',
        reps: holdReps('Cable Squat'),
        emoji: muscleEmoji,
        tips: muscleTips('Quad', 'Cable Squat'),
    },
    {
        id: 'q5',
        name: 'Cable Leg Extension',
        targetMuscles: 'Quad',
        sets: '3',
        reps: holdReps('Cable Leg Extension'),
        emoji: muscleEmoji,
        tips: muscleTips('Quad', 'Cable Leg Extension'),
    },
];

export const calfExercises: ExerciseType[] = [
    {
        id: 'ca1',
        name: 'Standing Calf Raise',
        targetMuscles: 'Calf',
        sets: '3',
        reps: holdReps('Standing Calf Raise'),
        emoji: muscleEmoji,
        tips: muscleTips('Calf', 'Standing Calf Raise'),
    },
    {
        id: 'ca2',
        name: 'Jump Rope',
        targetMuscles: 'Calf',
        sets: '3',
        reps: holdReps('Jump Rope'),
        emoji: muscleEmoji,
        tips: muscleTips('Calf', 'Jump Rope'),
    },
    {
        id: 'ca3',
        name: 'Dumbbell Calf Raise',
        targetMuscles: 'Calf',
        sets: '3',
        reps: holdReps('Dumbbell Calf Raise'),
        emoji: muscleEmoji,
        tips: muscleTips('Calf', 'Dumbbell Calf Raise'),
    },
    {
        id: 'ca4',
        name: 'Seated Dumbbell Calf Raise',
        targetMuscles: 'Calf',
        sets: '3',
        reps: holdReps('Seated Dumbbell Calf Raise'),
        emoji: muscleEmoji,
        tips: muscleTips('Calf', 'Seated Dumbbell Calf Raise'),
    },
    {
        id: 'ca5',
        name: 'Cable Toe Press',
        targetMuscles: 'Calf',
        sets: '3',
        reps: holdReps('Cable Toe Press'),
        emoji: muscleEmoji,
        tips: muscleTips('Calf', 'Cable Toe Press'),
    },
];
