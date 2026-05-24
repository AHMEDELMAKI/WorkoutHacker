import type { WorkoutPlan } from './types';
export declare const DEFAULT_EQUIPMENT: string[];
export declare const workoutRequestSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["daysPerWeek"];
    readonly properties: {
        readonly primaryGoal: {
            readonly type: "string";
            readonly enum: readonly ["hypertrophy", "strength"];
        };
        readonly trainingLevel: {
            readonly type: "string";
            readonly enum: readonly ["beginner", "intermediate", "advanced"];
        };
        readonly daysPerWeek: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 7;
        };
        readonly programDurationWeeks: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 52;
        };
        readonly equipmentAvailable: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly minItems: 1;
        };
        readonly demographics: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly gender: {
                    readonly type: "string";
                };
                readonly bodyWeight: {
                    readonly type: "number";
                    readonly minimum: 1;
                };
                readonly height: {
                    readonly type: "number";
                    readonly minimum: 1;
                };
                readonly age: {
                    readonly type: "number";
                    readonly minimum: 1;
                };
                readonly trainingAge: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
            };
        };
        readonly limitations: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly injuries: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly mobilityDifficulties: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly currentRPE: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 10;
        };
        readonly currentPlan: {
            readonly type: "object";
        };
        readonly naturalLanguageRequest: {
            readonly type: "string";
        };
    };
};
export declare const workoutPlanSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["planName", "primaryGoal", "trainingLevel", "daysPerWeek", "durationWeeks", "rationale", "interSetRecoveryPolicy", "progressiveOverload", "days"];
    readonly properties: {
        readonly planName: {
            readonly type: "string";
        };
        readonly primaryGoal: {
            readonly type: "string";
            readonly enum: readonly ["hypertrophy", "strength", "other"];
        };
        readonly trainingLevel: {
            readonly type: "string";
            readonly enum: readonly ["beginner", "intermediate", "advanced"];
        };
        readonly daysPerWeek: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 7;
        };
        readonly durationWeeks: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly rationale: {
            readonly type: "string";
        };
        readonly interSetRecoveryPolicy: {
            readonly type: "string";
        };
        readonly progressiveOverload: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["ruleName", "description"];
                readonly properties: {
                    readonly ruleName: {
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly days: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["dayLabel", "focus", "exercises"];
                readonly properties: {
                    readonly dayLabel: {
                        readonly type: "string";
                    };
                    readonly focus: {
                        readonly type: "string";
                    };
                    readonly warmup: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly exercises: {
                        readonly type: "array";
                        readonly minItems: 1;
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["exerciseName", "equipment", "sets"];
                            readonly properties: {
                                readonly exerciseName: {
                                    readonly type: "string";
                                };
                                readonly equipment: {
                                    readonly type: "string";
                                };
                                readonly notes: {
                                    readonly type: "string";
                                };
                                readonly sets: {
                                    readonly type: "object";
                                    readonly additionalProperties: false;
                                    readonly required: readonly ["sets", "weight", "reps", "rest", "targetRpe"];
                                    readonly properties: {
                                        readonly sets: {
                                            readonly type: "number";
                                            readonly minimum: 1;
                                        };
                                        readonly weight: {
                                            readonly type: "number";
                                            readonly minimum: 0;
                                        };
                                        readonly reps: {
                                            readonly type: "number";
                                            readonly minimum: 1;
                                            readonly maximum: 30;
                                        };
                                        readonly rest: {
                                            readonly type: "number";
                                            readonly minimum: 20;
                                            readonly maximum: 360;
                                        };
                                        readonly targetRpe: {
                                            readonly type: "number";
                                            readonly minimum: 5;
                                            readonly maximum: 10;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const planResponseSchemaText: string;
export declare function isWorkoutPlan(value: unknown): value is WorkoutPlan;
//# sourceMappingURL=schemas.d.ts.map