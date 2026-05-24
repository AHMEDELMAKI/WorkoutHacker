export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Demographics {
  gender?: string;
  bodyWeight?: number;
  height?: number;
  age?: number;
  trainingAge: number;
}

export interface Limitations {
  injuries?: string[];
  mobilityDifficulties?: string[];
}

export interface ExerciseSets {
  sets: number;
  weight: number;
  reps: number;
  rest: number;
  targetRpe: number;
}

export interface ExercisePrescription {
  exerciseName: string;
  equipment: string;
  notes?: string;
  sets: ExerciseSets;
}

export interface WorkoutDay {
  dayLabel: string;
  focus: string;
  warmup?: string[];
  exercises: ExercisePrescription[];
}

export interface ProgressiveOverloadRule {
  ruleName: string;
  description: string;
}

export interface WorkoutPlan {
  planName: string;
  primaryGoal: string;
  trainingLevel: TrainingLevel;
  daysPerWeek: number;
  durationWeeks: number | null;
  rationale: string;
  interSetRecoveryPolicy: string;
  progressiveOverload: ProgressiveOverloadRule[];
  days: WorkoutDay[];
}

export interface WorkoutRequest {
  primaryGoal?: string;
  trainingLevel?: TrainingLevel;
  daysPerWeek: number;
  programDurationWeeks?: number;
  equipmentAvailable?: string[];
  demographics?: {
    gender?: string;
    bodyWeight?: number;
    height?: number;
    age?: number;
    trainingAge?: number;
  };
  limitations?: Limitations;
  currentRPE?: number;
  currentPlan?: WorkoutPlan;
  naturalLanguageRequest?: string;
}

export interface NormalizedWorkoutRequest {
  primaryGoal: string;
  trainingLevel: TrainingLevel;
  daysPerWeek: number;
  programDurationWeeks: number | null;
  equipmentAvailable: string[];
  demographics: Demographics;
  limitations: Limitations;
  currentRPE?: number;
  currentPlan?: WorkoutPlan;
  naturalLanguageRequest?: string;
}

export interface ServerConfig {
  geminiApiKey: string;
  geminiModel?: string;
}

export interface ClientConfig {
  apiBaseUrl: string;
  endpointPath?: string;
  fetchImpl?: typeof fetch;
  headers?: Record<string, string>;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}
