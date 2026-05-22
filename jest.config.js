module.exports = {
  preset: 'react-native',

  // Prevent RN native module invariant failures during Jest runs in this repo
  // (needed for __tests__/App.test.tsx).
  setupFiles: ['<rootDir>/jest.setup.js'],

  // Some projects using react-native-gesture-handler require native code;
  // this keeps unit tests from failing when the native module isn't available.
  moduleNameMapper: {
    '^react-native-gesture-handler$': '<rootDir>/src/__mocks__/react-native-gesture-handler.ts',
  },
};
