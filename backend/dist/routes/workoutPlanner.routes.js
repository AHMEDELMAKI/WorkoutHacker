"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workoutPlannerRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
exports.workoutPlannerRouter = (0, express_1.Router)();
exports.workoutPlannerRouter.use(authenticate_1.authenticate);
// ─── POST /api/workout-planner/generate ─────────────────
// Proxies to the Gemini-powered workout planner
exports.workoutPlannerRouter.post('/generate', async (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        res.status(503).json({ error: 'AI planner not configured' });
        return;
    }
    try {
        const payload = req.body;
        // Re-use the existing core workout handler logic here
        // This keeps the existing Gemini integration working through the authenticated route
        const { createServerConfigFromEnv, createWorkoutHandler } = require('../../../core/dist/server/index.js');
        const handler = createWorkoutHandler(createServerConfigFromEnv(process.env));
        await handler(req, res);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Planner error' });
    }
});
//# sourceMappingURL=workoutPlanner.routes.js.map