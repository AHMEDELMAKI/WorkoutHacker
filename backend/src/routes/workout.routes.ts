import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/authenticate';

export const workoutRouter = Router();
workoutRouter.use(authenticate);

// ─── GET /api/workouts/exercises ────────────────────────
workoutRouter.get('/exercises', async (_req: Request, res: Response): Promise<void> => {
    const exercises = await prisma.exercise.findMany({
        orderBy: { name: 'asc' },
    });
    res.json(exercises);
});

// ─── GET /api/workouts/custom ────────────────────────────
workoutRouter.get('/custom', async (req: AuthRequest, res: Response): Promise<void> => {
    const workouts = await prisma.customWorkout.findMany({
        where: { userId: req.user!.sub },
        orderBy: { createdAt: 'desc' },
    });
    res.json(workouts);
});

// ─── POST /api/workouts/custom ───────────────────────────
workoutRouter.post(
    '/custom',
    [
        body('name').notEmpty().trim().isLength({ max: 100 }),
        body('description').optional().trim().isLength({ max: 500 }),
        body('exercises').isArray({ min: 1 }),
        body('durationMin').optional().isInt({ min: 1 }),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { name, description, exercises, durationMin } = req.body;
        const workout = await prisma.customWorkout.create({
            data: {
                userId: req.user!.sub,
                name,
                description: description || null,
                exercises,
                durationMin: durationMin || null,
            },
        });
        res.status(201).json(workout);
    },
);

// ─── PUT /api/workouts/custom/:id ────────────────────────
workoutRouter.put('/custom/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = await prisma.customWorkout.findFirst({
        where: { id, userId: req.user!.sub },
    });
    if (!existing) {
        res.status(404).json({ error: 'Workout not found' });
        return;
    }

    const { name, description, exercises, durationMin } = req.body;
    const updated = await prisma.customWorkout.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(exercises && { exercises }),
            ...(durationMin !== undefined && { durationMin }),
        },
    });
    res.json(updated);
});

// ─── DELETE /api/workouts/custom/:id ─────────────────────
workoutRouter.delete('/custom/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = await prisma.customWorkout.findFirst({
        where: { id, userId: req.user!.sub },
    });
    if (!existing) {
        res.status(404).json({ error: 'Workout not found' });
        return;
    }
    await prisma.customWorkout.delete({ where: { id } });
    res.json({ ok: true });
});
