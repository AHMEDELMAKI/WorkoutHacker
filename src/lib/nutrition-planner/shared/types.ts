export type DietaryGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general_health';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export interface MacroBreakdown {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface FoodItem {
  foodName: string;
  portion: string;
  macros: MacroBreakdown;
  notes?: string;
}

export interface Meal {
  mealLabel: string;
  mealTime: string;
  foods: FoodItem[];
  mealMacros: MacroBreakdown;
}

export interface HydrationGuideline {
  ruleName: string;
  description: string;
}

export interface NutritionDay {
  dayLabel: string;
  focus: string;
  meals: Meal[];
  dailyTotals: MacroBreakdown;
}

export interface ProgressionRule {
  ruleName: string;
  description: string;
}

export interface NutritionPlan {
  planName: string;
  primaryGoal: DietaryGoal;
  activityLevel: ActivityLevel;
  daysPerWeek: number;
  durationWeeks: number | null;
  rationale: string;
  hydrationGuidelines: HydrationGuideline[];
  progressionRules: ProgressionRule[];
  days: NutritionDay[];
}

export interface NutritionRequest {
  primaryGoal?: string;
  activityLevel?: ActivityLevel;
  daysPerWeek: number;
  planDurationWeeks?: number;
  preferredFoods?: string[];
  demographics?: {
    gender?: string;
    bodyWeight?: number;
    height?: number;
    age?: number;
    activityLevel?: ActivityLevel;
  };
  dietaryRestrictions?: {
    allergies?: string[];
    intolerances?: string[];
    dietType?: string;
  };
  mealsPerDay?: number;
  currentCalorieIntake?: number;
  currentPlan?: NutritionPlan;
  naturalLanguageRequest?: string;
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
