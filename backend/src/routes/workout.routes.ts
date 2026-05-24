import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/authenticate';

export const workoutRouter = Router();

// Get all built-in workouts - NOTE: This is now empty as JSON files were removed.
// This should be implemented to pull from a database of exercises/templates.
workoutRouter.get('/', async (req, res) => {
    res.json({
        fullBody: [],
        upper: [],
        lower: [],
    });
});

// Get user's custom workouts
workoutRouter.get('/custom', authenticate, async (req: AuthRequest, res) => {
    const workouts = await prisma.customWorkout.findMany({
        where: { userId: req.user!.sub },
        include: { exercises: true },
    });
    res.json(workouts);
});

// Create a custom workout
workoutRouter.post(
    '/custom',
    authenticate,
    [
        body('name').notEmpty().withMessage('Workout name is required'),
        body('exercises').isArray({ min: 1 }).withMessage('At least one exercise is required'),
    ],
    async (req: AuthRequest, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, exercises } = req.body;
        const workout = await prisma.customWorkout.create({
            data: {
                name,
                userId: req.user!.sub,
                exercises: {
                    connect: exercises.map((id: string) => ({ id })),
                },
            },
            include: { exercises: true },
        });
        res.status(201).json(workout);
    }
);

// Update a custom workout
workoutRouter.put('/custom/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { id: paramId } = req.params;
    if (typeof paramId !== 'string') {
        return res.status(400).json({ error: 'Invalid workout ID.' });
    }
    const id = paramId;

    const { name, exercises } = req.body;
    const workout = await prisma.customWorkout.update({
        where: { id, userId: req.user!.sub },
        data: {
            name,
            exercises: {
                set: exercises.map((id: string) => ({ id })),
            },
        },
        include: { exercises: true },
    });
    res.json(workout);
});

// Delete a custom workout
workoutRouter.delete('/custom/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { id: paramId } = req.params;
    if (typeof paramId !== 'string') {
        return res.status(400).json({ error: 'Invalid workout ID.' });
    }
    const id = paramId;

    // First check if user owns workout
    const workout = await prisma.customWorkout.findFirst({
        where: { id, userId: req.user!.sub },
    });
    if (!workout) {
        return res.status(404).json({ error: 'Workout not found or you do not have permission' });
    }

    await prisma.customWorkout.delete({ where: { id } });
    res.status(204).send();
});
