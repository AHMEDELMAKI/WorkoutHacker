const express = require('express');
const {
  createServerConfigFromEnv,
  createWorkoutHandler,
} = require('../../core/dist/server/index.js')
require('dotenv').config();
const app = express();
const port = Number(process.env.PORT || 3000);
let requestCounter = 0;

const workoutHandler = createWorkoutHandler(createServerConfigFromEnv(process.env));

app.use(express.json());
app.use((req, res, next) => {
  const reqId = `req_${Date.now()}_${++requestCounter}`;
  const startedAt = Date.now();
  req.requestId = reqId;

  process.stdout.write(
    `[server][${reqId}] ${req.method} ${req.path} request debugHeader=${req.headers['x-debug-request-id'] || 'none'} query=${JSON.stringify(req.query)} body=${JSON.stringify(req.body)}\n`,
  );

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    res.bodyJson = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    const body = res.statusCode >= 400 && res.bodyJson ? JSON.stringify(res.bodyJson) : '';
    process.stdout.write(
      `[server][${reqId}] ${req.method} ${req.path} response status=${res.statusCode} elapsedMs=${Date.now() - startedAt}${body ? ` body=${body}` : ''}\n`,
    );
  });

  next();
});

app.get('/health', (_req, res) => {
  process.stdout.write('[server] health check requested\n');
  res.json({ ok: true, service: 'workout-planner-demo-server' });
});

app.post('/api/workout', async (req, res, next) => {
  const reqId = req.requestId || 'unknown';
  process.stdout.write(`[server][${reqId}] workout route start\n`);
  process.stdout.write(`[server][${reqId}] workout payload=${JSON.stringify(req.body)}\n`);
  try {
    await workoutHandler(req, res, next);
    process.stdout.write(`[server][${reqId}] workout route completed\n`);
  } catch (error) {
    process.stderr.write(
      `[server][${reqId}] workout handler threw error=${error instanceof Error ? error.stack || error.message : String(error)}\n`,
    );
    next(error);
  }
});

app.use((err, req, res, _next) => {
  const reqId = req.requestId || 'unknown';
  process.stderr.write(`[server][${reqId}] unhandled error=${err instanceof Error ? err.stack || err.message : String(err)}\n`);
  if (res.headersSent) {
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  process.stdout.write(`Workout demo server listening on http://localhost:${port}\n`);
  process.stdout.write(`[server] configured port=${port} hasGeminiApiKey=${Boolean(process.env.GEMINI_API_KEY)}\n`);
});
