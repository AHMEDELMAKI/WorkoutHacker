"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWorkoutPlanResponse = parseWorkoutPlanResponse;
exports.createPlanGenerator = createPlanGenerator;
const generative_ai_1 = require("@google/generative-ai");
const normalize_1 = require("./shared/normalize");
const schemas_1 = require("./shared/schemas");
const prompt_1 = require("./prompt");
const GEMINI_MODEL = 'gemma-4-31b-it';
const RETRY_MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function isRetryableError(error) {
    if (error instanceof generative_ai_1.GoogleGenerativeAIFetchError) {
        return error.status !== undefined && error.status >= 500;
    }
    return false;
}
function stripUnsupportedResponseSchemaFields(value) {
    if (Array.isArray(value)) {
        return value.map(stripUnsupportedResponseSchemaFields);
    }
    if (value && typeof value === 'object') {
        const next = {};
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
function toGeminiResponseSchema(value) {
    return stripUnsupportedResponseSchemaFields(JSON.parse(value));
}
function extractTextContent(response) {
    const typed = response;
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
function parseWorkoutPlanResponse(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch (error) {
        throw new Error(`Invalid JSON from model: ${error.message}`);
    }
    if (!(0, schemas_1.isWorkoutPlan)(parsed)) {
        throw new Error('Model response failed WorkoutPlan validation checks');
    }
    return parsed;
}
function createPlanGenerator(config) {
    if (!config.geminiApiKey) {
        throw new Error('geminiApiKey is required in server config');
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    return async function generateWorkoutPlan(request) {
        const normalized = (0, normalize_1.normalizeWorkoutRequest)(request);
        const systemPrompt = (0, prompt_1.buildSystemPrompt)(normalized);
        const userPrompt = (0, prompt_1.buildUserPrompt)(normalized);
        let lastError;
        for (let attempt = 1; attempt <= RETRY_MAX_ATTEMPTS; attempt++) {
            try {
                const result = await model.generateContent({
                    systemInstruction: systemPrompt,
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        responseSchema: toGeminiResponseSchema(schemas_1.planResponseSchemaText),
                    },
                });
                const jsonText = extractTextContent(result);
                return parseWorkoutPlanResponse(jsonText);
            }
            catch (error) {
                lastError = error;
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
//# sourceMappingURL=plan-generator.js.map