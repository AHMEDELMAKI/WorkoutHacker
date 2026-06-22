export type {
  ClientConfig,
  ErrorResponse,
  NutritionPlan,
  NutritionRequest,
} from './shared/types';

import type { ClientConfig, NutritionPlan, NutritionRequest } from './shared/types';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizeEndpointPath(endpointPath?: string): string {
  const path = endpointPath ?? '/api/nutrition';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generatePlan(
  clientConfig: ClientConfig,
  requestData: NutritionRequest,
): Promise<NutritionPlan> {
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
    }
    throw new Error(serverMessage);
  }

  return (await response.json()) as NutritionPlan;
}
