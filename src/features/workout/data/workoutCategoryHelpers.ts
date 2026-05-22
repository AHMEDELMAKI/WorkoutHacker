import type { ExerciseType, WorkoutCategory } from './workoutData';
import {
  abdominalExercises,
  bicepExercises,
  calfExercises,
  chestExercises,
  deltoidExercises,
  forearmExercises,
  fullBodyExercises,
  latsExercises,
  lowerBodyExercises,
  lumbarExercises,
  quadExercises,
  trapeziusExercises,
  tricepExercises,
  upperBodyExercises,
  workoutCategories,
} from './workoutData';

type Route = WorkoutCategory['route'];

export function getCategoryByRoute(route: Route): WorkoutCategory | undefined {
  return workoutCategories.find(c => c.route === route);
}

export function getExercisesByRoute(route: Route): ExerciseType[] {
  switch (route) {
    // Core templates
    case 'FullBodyWorkout':
      return fullBodyExercises;
    case 'UpperWorkout':
      return upperBodyExercises;
    case 'LowerWorkout':
      return lowerBodyExercises;
    case 'CustomWorkout':
      return [];

    // Muscle group workouts
    case 'DeltoidWorkout':
      return deltoidExercises;
    case 'BicepWorkout':
      return bicepExercises;
    case 'TricepWorkout':
      return tricepExercises;
    case 'ForearmWorkout':
      return forearmExercises;
    case 'ChestWorkout':
      return chestExercises;
    case 'AbdominalWorkout':
      return abdominalExercises;
    case 'LatsWorkout':
      return latsExercises;
    case 'TrapeziusWorkout':
      return trapeziusExercises;
    case 'LumbarWorkout':
      return lumbarExercises;
    case 'QuadWorkout':
      return quadExercises;
    case 'CalfWorkout':
      return calfExercises;

    default:
      return [];
  }
}
