export type {
  ClientConfig,
  ErrorResponse,
  NormalizedWorkoutRequest,
  WorkoutPlan,
  WorkoutRequest,
} from './types';

export { normalizeWorkoutRequest } from './normalize';

import type { ClientConfig, WorkoutPlan, WorkoutRequest } from './types';

// Local copy of the planner core client logic.
// (Avoids depending on `core/dist` and keeps TS/RN bundling simple.)
import { generatePlan as generatePlanInternal, normalizeWorkoutRequest as normalizeWorkoutRequestInternal } from './core/client';

export async function generatePlan(
  clientConfig: ClientConfig,
  requestData: WorkoutRequest,
): Promise<WorkoutPlan> {
  const startedAt = Date.now();
  const requestId = `client_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

  const normalizedRequest = normalizeWorkoutRequestInternal(requestData as WorkoutRequest);

  console.debug('[workoutPlanner-client] generatePlan request', {
    requestId,
    apiBaseUrl: clientConfig.apiBaseUrl,
    endpointPath: clientConfig.endpointPath ?? '/api/workout',
    request: requestData,
    elapsedMs: Date.now() - startedAt,
  });

  const plan = await generatePlanInternal(
    {
      apiBaseUrl: clientConfig.apiBaseUrl,
      endpointPath: clientConfig.endpointPath,
      fetchImpl: clientConfig.fetchImpl,
      headers: {
        ...(clientConfig.headers ?? {}),
        'x-debug-request-id': requestId,
      },
    },
    normalizedRequest as unknown as WorkoutRequest,
  );

  console.debug('[workoutPlanner-client] generatePlan success', {
    requestId,
    elapsedMs: Date.now() - startedAt,
    planName: plan.planName,
    daysPerWeek: plan.daysPerWeek,
  });

  return plan;
}
