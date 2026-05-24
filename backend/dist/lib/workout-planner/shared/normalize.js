"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWorkoutRequest = normalizeWorkoutRequest;
const schemas_1 = require("./schemas");
function normalizeLimitations(limitations) {
    return {
        injuries: limitations?.injuries ?? [],
        mobilityDifficulties: limitations?.mobilityDifficulties ?? [],
    };
}
function normalizeWorkoutRequest(request) {
    if (!Number.isFinite(request.daysPerWeek) || request.daysPerWeek < 1 || request.daysPerWeek > 7) {
        throw new Error('daysPerWeek must be between 1 and 7');
    }
    if (request.currentRPE !== undefined && (request.currentRPE < 1 || request.currentRPE > 10)) {
        throw new Error('currentRPE must be between 1 and 10');
    }
    if (request.programDurationWeeks !== undefined &&
        (!Number.isFinite(request.programDurationWeeks) || request.programDurationWeeks < 1)) {
        throw new Error('programDurationWeeks must be a positive number');
    }
    return {
        primaryGoal: request.primaryGoal ?? 'general_fitness',
        trainingLevel: request.trainingLevel ?? 'beginner',
        daysPerWeek: request.daysPerWeek,
        programDurationWeeks: request.programDurationWeeks ?? null,
        equipmentAvailable: request.equipmentAvailable?.length
            ? request.equipmentAvailable
            : schemas_1.DEFAULT_EQUIPMENT,
        demographics: {
            gender: request.demographics?.gender,
            bodyWeight: request.demographics?.bodyWeight,
            height: request.demographics?.height,
            age: request.demographics?.age,
            trainingAge: request.demographics?.trainingAge ?? 0,
        },
        limitations: normalizeLimitations(request.limitations),
        currentRPE: request.currentRPE,
        currentPlan: request.currentPlan,
        naturalLanguageRequest: request.naturalLanguageRequest,
    };
}
//# sourceMappingURL=normalize.js.map