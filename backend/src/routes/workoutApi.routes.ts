import { Router } from 'express';
import { createWorkoutHandler, createServerConfigFromEnv } from '@react-native-workout-planner/server';

export const workoutApiRouter = Router();

const config = createServerConfigFromEnv(process.env);

workoutApiRouter.post('/', createWorkoutHandler(config));
