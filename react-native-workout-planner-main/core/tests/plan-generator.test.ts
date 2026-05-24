import { parseWorkoutPlanResponse } from '../src/server/plan-generator';

const validPlanJson = JSON.stringify({
  planName: 'Strength Wave 4x',
  primaryGoal: 'strength',
  trainingLevel: 'advanced',
  daysPerWeek: 4,
  durationWeeks: 6,
  rationale: 'Wave loading with planned top-set progression.',
  interSetRecoveryPolicy: 'Main lifts 180-240s, accessories 60-90s.',
  progressiveOverload: [
    {
      ruleName: 'Wave increment',
      description: 'Add 2.5% to top sets each 2-week wave if RPE allows.',
    },
  ],
  days: [
    {
      dayLabel: 'Day 1',
      focus: 'Squat Priority',
      exercises: [
        {
          exerciseName: 'Back Squat',
          equipment: 'barbell',
          sets: { sets: 2, weight: 120, reps: 5, rest: 210, targetRpe: 8 },
        },
      ],
    },
  ],
});

describe('parseWorkoutPlanResponse', () => {
  it('parses valid JSON into a WorkoutPlan object', () => {
    const parsed = parseWorkoutPlanResponse(validPlanJson);
    expect(parsed.planName).toBe('Strength Wave 4x');
    expect(parsed.days.length).toBeGreaterThan(0);
  });

  it('throws when JSON is malformed', () => {
    expect(() => parseWorkoutPlanResponse('{bad-json')).toThrow('Invalid JSON');
  });

  it('throws when payload does not satisfy minimal WorkoutPlan shape', () => {
    expect(() => parseWorkoutPlanResponse(JSON.stringify({ foo: 'bar' }))).toThrow(
      'Model response failed WorkoutPlan validation checks',
    );
  });
});
