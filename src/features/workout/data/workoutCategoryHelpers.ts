import type { ExerciseType, WorkoutCategory } from './workoutData';
import {
  fullBodyExercises,
  lowerBodyExercises,
  upperBodyExercises,
  workoutCategories,
} from './workoutData';

type Route = WorkoutCategory['route'];

export function getCategoryByRoute(route: Route): WorkoutCategory | undefined {
  return workoutCategories.find(c => c.route === route);
}

export function getExercisesByRoute(route: Route): ExerciseType[] {
  switch (route) {
    case 'FullBodyWorkout':
      return fullBodyExercises;
    case 'UpperWorkout':
      return upperBodyExercises;
    case 'LowerWorkout':
      return lowerBodyExercises;
    case 'CustomWorkout':
    default:
      return [];
  }
}
