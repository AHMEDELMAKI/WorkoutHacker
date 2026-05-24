# WorkoutPlannerDemo

React Native example app that validates workout planner behavior in a real RN runtime against a local Express server.

## What this demo does

- Runs a local API server and Metro from one command.
- Uses the local `core/dist` build for client/server imports.
- Lets you submit a workout request and inspect returned plan JSON.

## Prerequisites

- Complete React Native environment setup: https://reactnative.dev/docs/environment-setup
- Provide a Gemini API key in your shell:

```sh
export GEMINI_API_KEY="your_key_here"
```

The demo app now ships as a release asset (`workout-planner-example-<tag>.tar.gz`) alongside the client/server tarballs.

## Install

```sh
cd example
npm install
```

## Run demo (server + metro)

```sh
cd example
npm start
```

This runs:

- `npm run prepare:core` (builds local core package to `core/dist`)
- `node ./server/index.js` (Express API at `http://localhost:3000`)
- `react-native start` (Metro)

## Build release JS bundles only

```sh
mkdir -p ../release-assets/example/android ../release-assets/example/ios
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output ../release-assets/example/android/index.android.bundle --assets-dest ../release-assets/example/android
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ../release-assets/example/ios/main.jsbundle --assets-dest ../release-assets/example/ios
```

These are the same bundle artifacts packaged into `workout-planner-example-<tag>.tar.gz` in CI.

## Run app

In a second terminal:

```sh
cd example
npm run android
```

or

```sh
cd example
npm run ios
```

## Notes

- The app uses `http://10.0.2.2:3000` on Android emulator and `http://localhost:3000` on iOS.
- Endpoint tested by the app: `POST /api/workout`
- Health check endpoint: `GET /health`
