declare module 'react-native-vosk' {
  type VoskResult = { text?: string };
  type Subscription = { remove: () => void };
  type VoskOptions = {
    grammar?: string[];
    timeout?: number;
  };

  export function loadModel(modelName: string): Promise<void>;
  export function start(options?: VoskOptions): Promise<void>;
  export function stop(): Promise<void>;
  export function unload(): void;
  export function onResult(cb: (result: string) => void): Subscription;
}
