"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkoutHandler = createWorkoutHandler;
const plan_generator_1 = require("./plan-generator");
function createWorkoutHandler(config) {
    const generateWorkoutPlan = (0, plan_generator_1.createPlanGenerator)(config);
    return async function workoutHandler(req, res) {
        try {
            const request = req.body;
            const plan = await generateWorkoutPlan(request);
            res.status(200).json(plan);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown server error';
            res.status(400).json({ error: message });
        }
    };
}
//# sourceMappingURL=handler.js.map