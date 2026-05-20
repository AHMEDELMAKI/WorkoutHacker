import type { Request, Response } from 'express';

import { createWorkoutHandler } from '../src/server/handler';

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  const FakeFetchError = class extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.status = status;
    }
  };
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
    GoogleGenerativeAIFetchError: FakeFetchError,
  };
});

const samplePlan = {
  planName: '4-Day Strength Builder',
  primaryGoal: 'strength',
  trainingLevel: 'intermediate',
  daysPerWeek: 4,
  durationWeeks: 8,
  rationale: 'Progressive barbell-based plan with controlled volume.',
  interSetRecoveryPolicy: 'Compounds 150-210s, accessories 60-90s.',
  progressiveOverload: [
    {
      ruleName: 'Top set progression',
      description: 'Increase 2.5% when all reps achieved at target RPE.',
    },
  ],
  days: [
    {
      dayLabel: 'Day 1',
      focus: 'Lower Strength',
      exercises: [
        {
          exerciseName: 'Back Squat',
          equipment: 'barbell',
          sets: { sets: 2, weight: 100, reps: 5, rest: 180, targetRpe: 8 },
        },
        {
          exerciseName: 'Romanian Deadlift',
          equipment: 'barbell',
          sets: { sets: 2, weight: 80, reps: 8, rest: 120, targetRpe: 8 },
        },
        {
          exerciseName: 'Leg Press',
          equipment: 'machines',
          sets: { sets: 2, weight: 0, reps: 10, rest: 90, targetRpe: 8 },
        },
        {
          exerciseName: 'Calf Raise',
          equipment: 'machines',
          sets: { sets: 2, weight: 0, reps: 12, rest: 60, targetRpe: 8 },
        },
      ],
    },
  ],
};

function createMockResponse() {
  const response: Partial<Response> = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response as Response;
}

describe('createWorkoutHandler', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('returns a JSON workout plan with 200 status', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(samplePlan),
      },
    });

    const handler = createWorkoutHandler({ geminiApiKey: 'test-key' });
    const req = { body: { daysPerWeek: 4, trainingLevel: 'intermediate' } } as Request;
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(samplePlan);
  });

  it('returns 400 with error payload when model response is invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'not-valid-json',
      },
    });

    const handler = createWorkoutHandler({ geminiApiKey: 'test-key' });
    const req = { body: { daysPerWeek: 4 } } as Request;
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Invalid JSON') }),
    );
  });
});
