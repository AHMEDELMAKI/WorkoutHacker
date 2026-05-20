import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from '@google/generative-ai';
import type { ResponseSchema } from '@google/generative-ai';

import { normalizeWorkoutRequest } from '../shared/normalize';
import { isWorkoutPlan, planResponseSchemaText } from '../shared/schemas';
import type { ServerConfig, WorkoutPlan, WorkoutRequest } from '../shared/types';
import { buildSystemPrompt, buildUserPrompt } from './prompt';

const GEMINI_MODEL = 'gemma-4-31b-it';

const RETRY_MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return error.status !== undefined && error.status >= 500;
  }
  return false;
}

function stripUnsupportedResponseSchemaFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUnsupportedResponseSchemaFields);
  }

  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === 'additionalProperties') {
        continue;
      }
      next[key] = stripUnsupportedResponseSchemaFields(child);
    }
    return next;
  }

  return value;
}

function toGeminiResponseSchema(value: string): ResponseSchema {
  return stripUnsupportedResponseSchemaFields(JSON.parse(value)) as ResponseSchema;
}

function extractTextContent(response: unknown): string {
  const typed = response as {
    response?: {
      text?: () => string;
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
  };

  const direct = typed.response?.text?.();
  if (direct && direct.trim().length > 0) {
    return direct;
  }

  const partText = typed.response?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();

  if (partText) {
    return partText;
  }

  throw new Error('Gemini returned an empty response payload');
}

export function parseWorkoutPlanResponse(text: string): WorkoutPlan {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON from model: ${(error as Error).message}`);
  }

  if (!isWorkoutPlan(parsed)) {
    throw new Error('Model response failed WorkoutPlan validation checks');
  }

  return parsed;
}

export function createPlanGenerator(config: ServerConfig) {
  if (!config.geminiApiKey) {
    throw new Error('geminiApiKey is required in server config');
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  return async function generateWorkoutPlan(request: WorkoutRequest): Promise<WorkoutPlan> {
    const normalized = normalizeWorkoutRequest(request);
    const systemPrompt = buildSystemPrompt(normalized);
    const userPrompt = buildUserPrompt(normalized);

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= RETRY_MAX_ATTEMPTS; attempt++) {
      try {
        const result = await model.generateContent({
          systemInstruction: systemPrompt,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: toGeminiResponseSchema(planResponseSchemaText),
          },
        });

        const jsonText = extractTextContent(result);
        return parseWorkoutPlanResponse(jsonText);
      } catch (error) {
        lastError = error as Error;
        if (attempt < RETRY_MAX_ATTEMPTS && isRetryableError(error)) {
          const backoff = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
          await delay(backoff);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  };
}
