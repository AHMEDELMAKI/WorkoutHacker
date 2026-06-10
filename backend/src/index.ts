import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { workoutRouter } from './routes/workout.routes';
import { sessionRouter } from './routes/session.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { notificationRouter } from './routes/notification.routes';
import { workoutApiRouter } from './routes/workoutApi.routes';

import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';


const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// ─── Security ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
}));

// ─── Rate Limiting ───────────────────────────────────────
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// ─── Parsing & Logging ──────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ─── Health ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'workout-hacker-api', ts: new Date().toISOString() });
});

// ─── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/workouts', workoutRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/workout', workoutApiRouter);




// ─── Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ─── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
    logger.info(`🚀 Workout Hacker API running on http://localhost:${PORT}`);
    logger.info(`   NODE_ENV = ${process.env.NODE_ENV}`);
});

export default app;
