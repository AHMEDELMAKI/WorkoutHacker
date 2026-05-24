import type { Request, Response } from 'express';

import { createPlanGenerator } from './plan-generator';
import type { ServerConfig, WorkoutRequest } from '../shared/types';

export function createWorkoutHandler(config: ServerConfig) {
  const generateWorkoutPlan = createPlanGenerator(config);

  return async function workoutHandler(req: Request, res: Response): Promise<void> {
    try {
      const request = req.body as WorkoutRequest;
      const plan = await generateWorkoutPlan(request);
      res.status(200).json(plan);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown server error';
      res.status(400).json({ error: message });
    }
  };
}
