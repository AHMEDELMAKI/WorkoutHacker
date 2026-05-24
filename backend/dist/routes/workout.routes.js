"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workoutRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
exports.workoutRouter = (0, express_1.Router)();
// Get all built-in workouts - NOTE: This is now empty as JSON files were removed.
// This should be implemented to pull from a database of exercises/templates.
exports.workoutRouter.get('/', async (req, res) => {
    res.json({
        fullBody: [],
        upper: [],
        lower: [],
    });
});
// Get user's custom workouts
exports.workoutRouter.get('/custom', authenticate_1.authenticate, async (req, res) => {
    const workouts = await prisma_1.prisma.customWorkout.findMany({
        where: { userId: req.user.sub },
        include: { exercises: true },
    });
    res.json(workouts);
});
// Create a custom workout
exports.workoutRouter.post('/custom', authenticate_1.authenticate, [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Workout name is required'),
    (0, express_validator_1.body)('exercises').isArray({ min: 1 }).withMessage('At least one exercise is required'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, exercises } = req.body;
    const workout = await prisma_1.prisma.customWorkout.create({
        data: {
            name,
            userId: req.user.sub,
            exercises: {
                connect: exercises.map((id) => ({ id })),
            },
        },
        include: { exercises: true },
    });
    res.status(201).json(workout);
});
// Update a custom workout
exports.workoutRouter.put('/custom/:id', authenticate_1.authenticate, async (req, res) => {
    const { id: paramId } = req.params;
    if (typeof paramId !== 'string') {
        return res.status(400).json({ error: 'Invalid workout ID.' });
    }
    const id = paramId;
    const { name, exercises } = req.body;
    const workout = await prisma_1.prisma.customWorkout.update({
        where: { id, userId: req.user.sub },
        data: {
            name,
            exercises: {
                set: exercises.map((id) => ({ id })),
            },
        },
        include: { exercises: true },
    });
    res.json(workout);
});
// Delete a custom workout
exports.workoutRouter.delete('/custom/:id', authenticate_1.authenticate, async (req, res) => {
    const { id: paramId } = req.params;
    if (typeof paramId !== 'string') {
        return res.status(400).json({ error: 'Invalid workout ID.' });
    }
    const id = paramId;
    // First check if user owns workout
    const workout = await prisma_1.prisma.customWorkout.findFirst({
        where: { id, userId: req.user.sub },
    });
    if (!workout) {
        return res.status(404).json({ error: 'Workout not found or you do not have permission' });
    }
    await prisma_1.prisma.customWorkout.delete({ where: { id } });
    res.status(204).send();
});
//# sourceMappingURL=workout.routes.js.map