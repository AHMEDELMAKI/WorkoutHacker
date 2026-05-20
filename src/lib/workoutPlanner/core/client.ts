export type {
  ClientConfig,
  ErrorResponse,
  NormalizedWorkoutRequest,
  WorkoutPlan,
  WorkoutRequest,
} from './shared/types';

export { normalizeWorkoutRequest } from './shared/normalize';

import type { ClientConfig, WorkoutPlan, WorkoutRequest } from './shared/types';

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

  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientConfig.headers ?? {}),
      },
      body: JSON.stringify(requestData),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : 'UnknownError';

    throw new Error(
      `Network request failed (name=${name}) endpoint=${endpoint} apiBaseUrl=${clientConfig.apiBaseUrl} endpointPath=${clientConfig.endpointPath ?? '/api/workout'} message=${message}`,
    );
  }

  if (!response.ok) {
    let serverMessage = `Request failed with status ${response.status}`;
    let responseBody: string | undefined;

    try {
      responseBody = await response.text();
      if (responseBody?.trim()) {
        // Often server returns JSON: { error: "..."}; attempt to extract, but fall back to raw text.
        try {
          const errorJson = JSON.parse(responseBody) as { error?: string };
          if (errorJson?.error) serverMessage = errorJson.error;
          else serverMessage = responseBody;
        } catch {
          serverMessage = responseBody;
        }
      }
    } catch {
      // ignore body read errors
    }

    throw new Error(
      `${serverMessage} (status=${response.status}) endpoint=${endpoint} responseBody=${responseBody ? responseBody.slice(0, 2000) : 'none'}`,
    );
  }

  return (await response.json()) as WorkoutPlan;
}
