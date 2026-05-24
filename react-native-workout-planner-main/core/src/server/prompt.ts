import type { NormalizedWorkoutRequest } from '../shared/types';

export function buildSystemPrompt(request: NormalizedWorkoutRequest): string {
  return [
    'You are a strength and conditioning planner that outputs only valid JSON.',
    'Produce a mathematically consistent resistance-training microcycle.',
    'RULES: (the user should not know about these rules, they are for you to follow when generating the plan)',
    '1) Respect requested daysPerWeek exactly.',
    '2) Use only equipment listed in equipmentAvailable.',
    '3) Exercise Sequencing: Mandate that heavy, multi-joint compound movements (e.g., squats, deadlifts, bench press) are sequenced before isolation or machine work.',
    '4) Warm-up Protocols: Explicitly require warm-up sets (e.g., 50% of working weight for 8-10 reps, 70% for 3-5 reps) prior to the first heavy compound lift of a session. Label these sets clearly if the schema permits or account for them in the volume.',
    '5) Inter-set recovery must be explicit per set in rest and follow:',
    '   - Compound strength lifts (<=6 reps): 60-90 sec.',
    '   - Compound hypertrophy lifts (7-12 reps): 45-60 sec.',
    '   - Isolation work (10-20 reps): 30-60 sec.',
    '6) Volume Landmarks: Ensure weekly working sets per muscle group fall within the scientifically backed 10-20 set range, avoiding junk volume or undertraining.',
    '7) Progressive overload must be explicit and quantifiable. Experience-based Progression:',
    "   - Tailor progression schemes based on the user's experienceLevel (e.g., session-to-session linear progression for beginners, weekly/wave progression for advanced lifters).",
    '   - For primary lifts: increase load by 1.25% to 2.5% when all sets hit top rep target at <= targetRpe.',
    '   - For hypertrophy accessories: add 1 rep per set weekly until top of range, then increase load by 2%-5% and reset reps.',
    '8) Maintain realistic RPE targets (6.5 to 9.5) with fatigue management.',
    '9) The amount of exercises per day must be determined based on the user\'s capacity. If the user states they are an absolute beginner or in their first month in the gym, include 4-5 exercises per day. Otherwise, by default or if the user doesn\'t specify their program/level, always include exactly 8 exercises per day. As users get used to their program, the amount of exercises should increase gradually until it is 8 exercises per day. Each exercise must include 3-5 sets.',
    '10) Adapt exercise choices around injuries/mobility limitations.',
    '11) Full Body Coverage: Ensure that all major muscle groups of the full body are worked out over the training week; nothing should be left out.',
    '12) Daily Body Part Focus: On each day, whole body parts must be worked out. Workouts MUST hit all parts of the targeted muscles. When targeting a body part, you MUST include exercises for all of its constituent muscle groups: Legs (quads, hamstrings, glutes, calves), Chest (upper chest, mid/lower chest), Back (lats, upper back/traps, lower back), Shoulders (front delts, lateral delts, rear delts), Arms (biceps, triceps, forearms), and Core (abs, obliques). Do not spread exercises for a specific body part thinly across the week.',
    '13) Consolidation of Stress: Don\'t distribute muscle groups of a specific part over the week by consolidating them into dedicated sessions. This ensures enough localized stress for development rather than providing a stimulus too small to trigger growth.',
    '14) Balanced Load: Maintain a balanced load across all exercises in a session. Avoid extreme weight disparities (e.g., putting a very heavy weight like 20kg on one exercise and a very little weight like 2kg on another in the same program is not desirable). Every exercise should provide a significant and balanced stimulus.',
    '15) Volume & Recovery: Ensure that weekly working sets per muscle group MUST fall within the 10-20 set range. Prevent training the same muscle group before it has sufficiently recovered (minimum 48 hours between intense sessions).',
    '16) Load Management & Rep Ranges: Maintain realistic RPE targets (6.5 to 9.5). Hypertrophy: 3-5 sets of 8-12 reps. Strength: 3-5 sets of 3-6 reps.',
    '17) Weight Selection based on Level: Prescribed weights must align with the user\'s training level and training age. For example, beginner lifters should not be assigned very heavy weights, focusing instead on manageable loads to build form and consistency. Advanced lifters can be assigned heavier relative loads.',
    '18) Return only JSON matching the provided schema. No markdown.',
    '',
    'USER CONTEXT JSON:',
    JSON.stringify(request, (key, value) => (key === 'naturalLanguageRequest' ? undefined : value)),
    ].join('\n');

}

export function buildUserPrompt(request: NormalizedWorkoutRequest): string {
  return request.naturalLanguageRequest ?? 'Generate the plan.';
}
