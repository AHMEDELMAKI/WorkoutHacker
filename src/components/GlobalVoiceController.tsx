import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import {
  ensureMicPermission,
  ensureVoskModel,
  startVosk,
  stopVosk,
  subscribeVoskResults,
  getModelLoadError,
} from '../services/voskService';
import { emitVoiceAction } from '../services/voiceActionBus';
import { navigateRoot, isNavigationReady } from '../services/navigationService';
import { speak } from '../services/ttsService';
import { fullBodyExercises, upperBodyExercises, lowerBodyExercises } from '../features/workout/data/workoutData';

const screenRouteMap: Record<string, { screen: string }> = {
  home: { screen: 'Home' },
  workout: { screen: 'Workout' },
  progress: { screen: 'ProgressStack' },
  profile: { screen: 'ProfileStack' },
  coach: { screen: 'AICoach' },
};

const workoutRouteMap: Record<string, { screen: string }> = {
  'full body': { screen: 'FullBodyWorkout' },
  'upper body': { screen: 'UpperWorkout' },
  'lower body': { screen: 'LowerWorkout' },
  'custom': { screen: 'CustomWorkout' },
};

const exerciseMap: Record<string, any> = {
  // Full body exercises
  'burpees': fullBodyExercises.find(e => e.name.toLowerCase().includes('burpees')),
  'jump squats': fullBodyExercises.find(e => e.name.toLowerCase().includes('jump squats')),
  'push ups': fullBodyExercises.find(e => e.name.toLowerCase().includes('push-ups')),
  'pushups': fullBodyExercises.find(e => e.name.toLowerCase().includes('push-ups')),
  'mountain climbers': fullBodyExercises.find(e => e.name.toLowerCase().includes('mountain climbers')),
  'plank': fullBodyExercises.find(e => e.name.toLowerCase().includes('plank')),
  'high knees': fullBodyExercises.find(e => e.name.toLowerCase().includes('high knees')),

  // Upper body exercises
  'pike push ups': upperBodyExercises.find(e => e.name.toLowerCase().includes('pike push-ups')),
  'pike pushups': upperBodyExercises.find(e => e.name.toLowerCase().includes('pike push-ups')),
  'diamond push ups': upperBodyExercises.find(e => e.name.toLowerCase().includes('diamond push-ups')),
  'diamond pushups': upperBodyExercises.find(e => e.name.toLowerCase().includes('diamond push-ups')),
  'wide push ups': upperBodyExercises.find(e => e.name.toLowerCase().includes('wide push-ups')),
  'wide pushups': upperBodyExercises.find(e => e.name.toLowerCase().includes('wide push-ups')),
  'tricep dips': upperBodyExercises.find(e => e.name.toLowerCase().includes('tricep dips')),
  'arm circles': upperBodyExercises.find(e => e.name.toLowerCase().includes('arm circles')),

  // Lower body exercises
  'squats': lowerBodyExercises.find(e => e.name.toLowerCase().includes('squats')),
  'lunges': lowerBodyExercises.find(e => e.name.toLowerCase().includes('lunges')),
  'glute bridges': lowerBodyExercises.find(e => e.name.toLowerCase().includes('glute bridges')),
};

const resolveVoiceScreen = (command: string) => {
  const normalized = command.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^(go to|open)\s+(.+)$/);
  if (!match) {
    return null;
  }
  const target = match[2].trim();
  return Object.entries(screenRouteMap).find(([key]) => target.includes(key))?.[1] ?? null;
};

// this normalizes the voice and makes sure its correct
const resolveWorkoutScreen = (command: string) => {
  const normalized = command.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^(do|start|open)\s+(.+?)\s*(workout|exercise)?$/);
  if (!match) {
    return null;
  }
  const target = match[2].trim();
  return Object.entries(workoutRouteMap).find(([key]) => target.includes(key))?.[1] ?? null;
};

const GlobalVoiceController: React.FC = () => {
  useEffect(() => {
    let mounted = true;

    const setupVoice = async () => {
      try {
        console.log('[GlobalVoiceController] Starting setup');
        
        const granted = await ensureMicPermission();
        if (!granted) {
          console.log('[GlobalVoiceController] Microphone permission denied');
          if (mounted) {
            Alert.alert(
              'Microphone Permission Required',
              'Global voice control requires microphone access.',
            );
          }
          return;
        }

        if (!mounted) {
          return;
        }

        console.log('[GlobalVoiceController] Loading Vosk model');
        await ensureVoskModel();
        
        if (!mounted) {
          return;
        }
        
        console.log('[GlobalVoiceController] Starting Vosk');
        await startVosk();
        
        if (mounted) {
          console.log('[GlobalVoiceController] Voice control initialized successfully');
        }
      } catch (error) {
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const modelError = getModelLoadError();
          console.error('[GlobalVoiceController] Setup error:', errorMessage);
          
          Alert.alert(
            'Voice Control Error',
            `Could not initialize global voice control. Error: ${modelError || errorMessage}\\n\\nMake sure:\\n1. Vosk model exists at: android/app/src/main/assets/vosk-model-small-en-us-0.15/\\n2. You have rebuilt the app\\n3. Microphone permissions are granted`,
          );
        }
      }
    };

    setupVoice();

    const unsubscribe = subscribeVoskResults((command) => {
      if (!isNavigationReady()) {
        return;
      }

      // Normalize command: convert "work out" to "workout" and treat "exercise" as "workout"
      let normalizedCommand = command.toLowerCase()
        .replace(/\bwork out\b/g, 'workout')
        .replace(/\bexercise\b/g, 'workout');

      const screenRoute = resolveVoiceScreen(normalizedCommand);
      if (screenRoute) {
        void speak(`Going to ${screenRoute.screen.toLowerCase()}`);
        navigateRoot('Main', { screen: screenRoute.screen } as never);
        return;
      }

      const workoutRoute = resolveWorkoutScreen(normalizedCommand);
      if (workoutRoute) {
        void speak(`Opening ${workoutRoute.screen.replace('Workout', '').toLowerCase()} workout`);
        navigateRoot('Main', { screen: 'Workout' } as never);
        // Small delay to ensure navigation completes before navigating to workout screen
        setTimeout(() => {
          navigateRoot('Main', { screen: 'Workout', params: { screen: workoutRoute.screen } } as never);
        }, 100);
        return;
      }

      if (normalizedCommand.includes('start workout') || normalizedCommand.includes('press start workout') || normalizedCommand.includes('begin workout')) {
        void speak('Starting workout');
        emitVoiceAction('home_start_workout');
        return;
      }

      if (normalizedCommand.includes('end workout') || normalizedCommand.includes('finish workout') || normalizedCommand.includes('stop workout')) {
        void speak('Ending workout');
        emitVoiceAction('end_workout');
        return;
      }

      if (normalizedCommand.includes('check fatigue') || normalizedCommand.includes('fatigue level')) {
        void speak('Checking fatigue levels');
        emitVoiceAction('home_check_fatigue');
        return;
      }

      if (normalizedCommand.includes('press ask coach') || normalizedCommand.includes('ask coach')) {
        void speak('Opening AI coach');
        emitVoiceAction('ask_coach');
        return;
      }

      if (normalizedCommand.includes('open pike push ups') || normalizedCommand.includes('open pike pushups')) {
        void speak('Opening pike push-ups');
        emitVoiceAction('open_pike_pushups');
        return;
      }

      if (normalizedCommand.includes('open romanian deadlifts')) {
        void speak('Opening Romanian deadlifts');
        emitVoiceAction('open_romanian_deadlifts');
        return;
      }

      if (normalizedCommand.includes('open face pulls')) {
        void speak('Opening face pulls');
        emitVoiceAction('open_face_pulls');
        return;
      }

      // Workout-specific voice commands
      if (normalizedCommand.includes('do full body') || normalizedCommand.includes('full body workout')) {
        void speak('Opening full body workout');
        emitVoiceAction('open_full_body_workout');
        return;
      }

      if (normalizedCommand.includes('do upper body') || normalizedCommand.includes('upper body workout')) {
        void speak('Opening upper body workout');
        emitVoiceAction('open_upper_body_workout');
        return;
      }

      if (normalizedCommand.includes('do lower body') || normalizedCommand.includes('lower body workout')) {
        void speak('Opening lower body workout');
        emitVoiceAction('open_lower_body_workout');
        return;
      }

      if (normalizedCommand.includes('do custom') || normalizedCommand.includes('custom workout')) {
        void speak('Opening custom workout');
        emitVoiceAction('open_custom_workout');
        return;
      }

      // Exercise-specific voice commands
      const exerciseKeys = Object.keys(exerciseMap);
      for (const key of exerciseKeys) {
        if (normalizedCommand.includes(`do ${key}`) || normalizedCommand.includes(`start ${key}`) || normalizedCommand.includes(key)) {
          const exercise = exerciseMap[key];
          if (exercise) {
            void speak(`Opening ${exercise.name}`);
            // Emit specific exercise action
            const actionMap: Record<string, string> = {
              'burpees': 'do_burpees',
              'jump squats': 'do_jump_squats',
              'push ups': 'do_push_ups',
              'pushups': 'do_push_ups',
              'mountain climbers': 'do_mountain_climbers',
              'plank': 'do_plank',
              'high knees': 'do_high_knees',
              'pike push ups': 'do_pike_push_ups',
              'pike pushups': 'do_pike_push_ups',
              'diamond push ups': 'do_diamond_push_ups',
              'diamond pushups': 'do_diamond_push_ups',
              'wide push ups': 'do_wide_push_ups',
              'wide pushups': 'do_wide_push_ups',
              'tricep dips': 'do_tricep_dips',
              'arm circles': 'do_arm_circles',
              'squats': 'do_squats',
              'lunges': 'do_lunges',
              'glute bridges': 'do_glute_bridges',
            };

            const action = actionMap[key];
            if (action) {
              emitVoiceAction(action as any);
              return;
            }
          }
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      stopVosk().catch((error) => {
        console.warn('[GlobalVoiceController] Failed to stop Vosk on unmount', error);
      });
    };
  }, []);

  return null;
};

export default GlobalVoiceController;