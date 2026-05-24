"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const workout_routes_1 = require("./routes/workout.routes");
const session_routes_1 = require("./routes/session.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const notification_routes_1 = require("./routes/notification.routes");
const workoutPlanner_routes_1 = require("./routes/workoutPlanner.routes");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const workout_planner_1 = require("./lib/workout-planner");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '4000', 10);
// ─── Security ───────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
}));
// ─── Rate Limiting ───────────────────────────────────────
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// ─── Parsing & Logging ──────────────────────────────────
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
// ─── Health ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'workout-hacker-api', ts: new Date().toISOString() });
});
// ─── Routes ─────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/users', user_routes_1.userRouter);
app.use('/api/workouts', workout_routes_1.workoutRouter);
app.use('/api/sessions', session_routes_1.sessionRouter);
app.use('/api/analytics', analytics_routes_1.analyticsRouter);
app.use('/api/notifications', notification_routes_1.notificationRouter);
app.use('/api/workout-planner', workoutPlanner_routes_1.workoutPlannerRouter);
// Add the new workout plan generator route
const workoutPlanConfig = (0, workout_planner_1.createServerConfigFromEnv)(process.env);
app.post('/api/workout-plan', (0, workout_planner_1.createWorkoutHandler)(workoutPlanConfig));
// ─── Error Handler ──────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Workout Hacker API running on http://localhost:${PORT}`);
    logger_1.logger.info(`   NODE_ENV = ${process.env.NODE_ENV}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map