export type VoiceAction =
  | 'ask_coach'
  | 'open_pike_pushups'
  | 'open_romanian_deadlifts'
  | 'open_face_pulls'
  | 'home_start_workout'
  | 'home_check_fatigue'
  | 'open_full_body_workout'
  | 'open_upper_body_workout'
  | 'open_lower_body_workout'
  | 'open_custom_workout'
  | 'start_workout'
  | 'pause_workout'
  | 'end_workout'
  | 'do_burpees'
  | 'do_jump_squats'
  | 'do_push_ups'
  | 'do_mountain_climbers'
  | 'do_plank'
  | 'do_high_knees'
  | 'do_pike_push_ups'
  | 'do_diamond_push_ups'
  | 'do_wide_push_ups'
  | 'do_tricep_dips'
  | 'do_arm_circles'
  | 'do_squats'
  | 'do_lunges'
  | 'do_glute_bridges';

type VoiceActionListener = (action: VoiceAction) => void;

const listeners = new Set<VoiceActionListener>();

export const emitVoiceAction = (action: VoiceAction) => {
  listeners.forEach((listener) => listener(action));
};

export const subscribeVoiceAction = (listener: VoiceActionListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};