export type {
  ClientConfig,
  ErrorResponse,
  NormalizedWorkoutRequest,
  WorkoutPlan,
  WorkoutRequest,
} from '../shared/types';
export { normalizeWorkoutRequest } from '../shared/normalize';

import type { ClientConfig, WorkoutPlan, WorkoutRequest } from '../shared/types';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizeEndpointPath(endpointPath?: string): string {
  const path = endpointPath ?? '/api/workout';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generatePlan(
  clientConfig: ClientConfig,
  requestData: WorkoutRequest,
): Promise<WorkoutPlan> {
  const fetchImpl = clientConfig.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error('No fetch implementation found. Pass fetchImpl in clientConfig.');
  }

  const endpoint = `${normalizeBaseUrl(clientConfig.apiBaseUrl)}${normalizeEndpointPath(clientConfig.endpointPath)}`;
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(clientConfig.headers ?? {}),
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    let serverMessage = `Request failed with status ${response.status}`;
    try {
      const errorJson = (await response.json()) as { error?: string };
      if (errorJson?.error) {
        serverMessage = errorJson.error;
      }
    } catch {
      // ignore JSON parsing errors from server
    }
    throw new Error(serverMessage);
  }

  return (await response.json()) as WorkoutPlan;
}
