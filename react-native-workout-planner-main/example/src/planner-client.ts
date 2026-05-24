import {
  generatePlan as generatePlanInternal,
  type ClientConfig,
  type ErrorResponse,
  type NormalizedWorkoutRequest,
  type WorkoutPlan,
  type WorkoutRequest,
  normalizeWorkoutRequest,
} from '../../core/dist/client/index.js';

export type {
  ClientConfig,
  ErrorResponse,
  NormalizedWorkoutRequest,
  WorkoutPlan,
  WorkoutRequest,
};

export async function generatePlan(config: ClientConfig, request: WorkoutRequest): Promise<WorkoutPlan> {
  const startedAt = Date.now();
  const requestId = `client_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  const endpointPath = config.endpointPath ?? '/api/workout';
  const configWithDebugHeaders: ClientConfig = {
    ...config,
    endpointPath,
    headers: {
      ...(config.headers ?? {}),
      'x-debug-request-id': requestId,
    },
  };

  console.debug('[planner-client] generatePlan request', {
    requestId,
    apiBaseUrl: config.apiBaseUrl,
    endpointPath,
    request,
    headers: configWithDebugHeaders.headers,
  });

  try {
    const plan = await generatePlanInternal(configWithDebugHeaders, request);
    console.debug('[planner-client] generatePlan success', {
      requestId,
      elapsedMs: Date.now() - startedAt,
      planName: plan.planName,
      daysPerWeek: plan.daysPerWeek,
    });
    return plan;
  } catch (error) {
    console.error('[planner-client] generatePlan error', {
      requestId,
      elapsedMs: Date.now() - startedAt,
      error,
    });
    throw error;
  }
}

export { normalizeWorkoutRequest };
