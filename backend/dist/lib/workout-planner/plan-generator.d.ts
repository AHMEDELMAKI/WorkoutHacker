import type { ServerConfig, WorkoutPlan, WorkoutRequest } from './shared/types';
export declare function parseWorkoutPlanResponse(text: string): WorkoutPlan;
export declare function createPlanGenerator(config: ServerConfig): (request: WorkoutRequest) => Promise<WorkoutPlan>;
//# sourceMappingURL=plan-generator.d.ts.map