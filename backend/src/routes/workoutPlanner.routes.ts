import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';

export const workoutPlannerRouter = Router();
workoutPlannerRouter.use(authenticate);

// ─── POST /api/workout-planner/generate ─────────────────
// Proxies to the Gemini-powered workout planner
workoutPlannerRouter.post('/generate', async (req: Request, res: Response): Promise<void> => {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        res.status(503).json({ error: 'AI planner not configured' });
        return;
    }

    try {
        const payload = req.body;
        // Re-use the existing core workout handler logic here
        // This keeps the existing Gemini integration working through the authenticated route
        const { createServerConfigFromEnv, createWorkoutHandler } =
            require('../../../core/dist/server/index.js');
        const handler = createWorkoutHandler(createServerConfigFromEnv(process.env));
        await handler(req, res);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Planner error' });
    }
});
