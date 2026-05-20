declare module 'native-tts' {
  type PromiseVoid = Promise<void>;

  const WorkoutTtsModule: {
    speak: (text: string) => PromiseVoid;
    stop: () => PromiseVoid;
    shutdown: () => PromiseVoid;
  };

  export default WorkoutTtsModule;
}