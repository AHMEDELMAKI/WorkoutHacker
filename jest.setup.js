// Jest setup: mock RNGestureHandlerModule invariant that may break tests in RN envs.
jest.mock('react-native-gesture-handler/src/RNGestureHandlerModule', () => ({}));
