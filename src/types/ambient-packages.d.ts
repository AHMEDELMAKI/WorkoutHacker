declare module 'react-native-rep-counter' {
  export type RepCounterState = {
    phase: string
    reps: number
    confidence: number
    activeArm: string | null
  }

  export type RepCounterConfig = {
    exercise: string | null
  }

  export function createRepCounter(): {
    startSession(config: RepCounterConfig): void
    stopSession(): void
    update(buffer: number[], exercise: string | null): RepCounterState
  }
}

