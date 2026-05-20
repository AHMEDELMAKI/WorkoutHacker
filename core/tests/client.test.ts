import { generatePlan } from '../src/client';

const samplePlan = {
  planName: 'Beginner Hypertrophy Starter',
  primaryGoal: 'hypertrophy',
  trainingLevel: 'beginner',
  daysPerWeek: 3,
  durationWeeks: null,
  rationale: 'Low-complexity progression with manageable fatigue.',
  interSetRecoveryPolicy: 'Compounds 90-150s, accessories 45-75s.',
  progressiveOverload: [
    {
      ruleName: 'Rep progression',
      description: 'Add reps each week until ceiling, then add load.',
    },
  ],
  days: [
    {
      dayLabel: 'Day 1',
      focus: 'Full Body A',
      exercises: [
        {
          exerciseName: 'Goblet Squat',
          equipment: 'dumbbell',
          sets: { sets: 2, weight: 20, reps: 10, rest: 90, targetRpe: 7 },
        },
        {
          exerciseName: 'Push Up',
          equipment: 'bodyweight',
          sets: { sets: 2, weight: 0, reps: 8, rest: 60, targetRpe: 8 },
        },
      ],
    },
  ],
};

describe('generatePlan', () => {
  it('posts payload to configured endpoint and returns typed plan', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(samplePlan),
    });

    const result = await generatePlan(
      {
        apiBaseUrl: 'https://api.example.com/',
        endpointPath: '/api/workout',
        fetchImpl: mockFetch,
      },
      {
        daysPerWeek: 3,
      },
    );

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/api/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daysPerWeek: 3 }),
    });
    expect(result).toEqual(samplePlan);
  });

  it('throws server-provided error message on non-2xx response', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: 'Invalid request payload' }),
    });

    await expect(
      generatePlan(
        {
          apiBaseUrl: 'https://api.example.com',
          fetchImpl: mockFetch,
        },
        { daysPerWeek: 0 },
      ),
    ).rejects.toThrow('Invalid request payload');
  });
});
