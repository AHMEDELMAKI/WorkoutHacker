# @react-native-workout-planner

TypeScript package for generating highly personalized resistance training plans, designed for two runtime environments:

- React Native client apps (`@react-native-workout-planner/client`)
- Node.js/Express servers (`@react-native-workout-planner/server`)

The server side uses Gemma (`gemma-4-31b-it`) and strict JSON output rules to produce structured workout plans.

## Table of contents

- [Features](#features)
- [Project structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage (Server / Express)](#usage-server--express)
- [Usage (React Native client)](#usage-react-native-client)
- [Data contracts](#data-contracts)
- [Build and test](#build-and-test)
- [Release assets and GitHub Actions](#release-assets-and-github-actions)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Features

- Strict dual-entry architecture to avoid cross-environment bundling issues:
  - `./client -> ./dist/client/index.js`
  - `./server -> ./dist/server/index.js`
- Strong TypeScript interfaces for requests/plans.
- Request normalization and defaults (goal, level, equipment, demographics, etc.).
- Express middleware factory: `createWorkoutHandler(config)`.
- Gemma integration with:
  - required model `gemma-4-31b-it`
  - JSON-only output (`responseMimeType: application/json`)
  - schema-guided response validation
- Typed React Native fetch wrapper: `generatePlan(clientConfig, requestData)`.
- Environment bootstrap utility and CLI (`workout-planner-init`).

## Project structure

```text
.
├── .github/workflows/ci-release-assets.yml
├── core/
│   ├── src/
│   │   ├── client/
│   │   ├── server/
│   │   └── shared/
│   ├── tests/
│   └── package.json
└── README.md
```

## Installation

### Local development (this repository)

From `core/`:

```bash
npm install
```

### Install from GitHub release assets with npm

You can install the prebuilt client/server release tarballs directly from a GitHub Release.

Server bundle:

```bash
npm install "https://github.com/tony-div/react-native-workout-planner/releases/download/v0.1.1/workout-planner-server-v0.1.1.tar.gz"
```

Client bundle:

```bash
npm install "https://github.com/tony-div/react-native-workout-planner/releases/download/v0.1.1/workout-planner-client-v0.1.1.tar.gz"
```

You can also download the React Native example app release bundle:

```bash
curl -L -o workout-planner-example-v0.1.1.tar.gz "https://github.com/tony-div/react-native-workout-planner/releases/download/v0.1.1/workout-planner-example-v0.1.1.tar.gz"
```

Use the same URL pattern for newer versions by changing the tag and filename.

### Imports

Import only the environment-specific entry point:

```ts
import { generatePlan } from '@react-native-workout-planner/client';
import { createWorkoutHandler } from '@react-native-workout-planner/server';
```

## Configuration

### Environment variables

- `GEMINI_API_KEY` (server)
- `API_BASE_URL` (client)

Generate an environment template:

```bash
# from core/
npx workout-planner-init
```

This creates `.env.example` with required keys.

You can also create config programmatically:

```ts
import { createServerConfigFromEnv, createClientConfigFromEnv } from '@react-native-workout-planner/server';

const serverConfig = createServerConfigFromEnv(process.env);
const clientConfig = createClientConfigFromEnv(process.env);
```

## Usage (Server / Express)

```ts
import express from 'express';
import { createWorkoutHandler, createServerConfigFromEnv } from '@react-native-workout-planner/server';

const app = express();
app.use(express.json());

const config = createServerConfigFromEnv(process.env);
app.post('/api/workout', createWorkoutHandler(config));

app.listen(3000, () => {
  console.log('Workout server listening on :3000');
});
```

Server behavior:

1. Validates + normalizes incoming `WorkoutRequest`.
2. Builds a strict prompt with inter-set recovery and overload rules.
3. Calls Gemma model `gemma-4-31b-it`.
4. Requires JSON response, parses and validates shape.
5. Returns `WorkoutPlan` JSON to client.

## Usage (React Native client)

```ts
import { generatePlan } from '@react-native-workout-planner/client';

const plan = await generatePlan(
  {
    apiBaseUrl: 'https://your-api.example.com',
    endpointPath: '/api/workout', // optional, defaults to /api/workout
  },
  {
    daysPerWeek: 4,
    primaryGoal: 'strength',
    trainingLevel: 'intermediate',
    equipmentAvailable: ['barbell', 'dumbbell', 'bodyweight'],
  },
);
```

Optional advanced client config:

- `fetchImpl` (custom fetch implementation)
- `headers` (auth headers, tracing IDs, etc.)

## Data contracts

Core interfaces are in `core/src/shared/types.ts`:

- `WorkoutRequest`
- `WorkoutPlan`
- `WorkoutDay`, `ExercisePrescription`, `WorkoutSet`
- `ClientConfig`, `ServerConfig`

Schemas are in `core/src/shared/schemas.ts`:

- `workoutRequestSchema`
- `workoutPlanSchema`

Defaults are applied in `core/src/shared/normalize.ts`:

- `primaryGoal` defaults to `general_fitness`
- `trainingLevel` defaults to `beginner`
- `equipmentAvailable` defaults to all supported equipment
- `demographics.trainingAge` defaults to `0`
- `programDurationWeeks` defaults to `null`

## Build and test

From `core/`:

```bash
npm ci
npm run lint
npm test
npm run build
```

Build output is generated to:

- `core/dist/client`
- `core/dist/server`

## Release assets and GitHub Actions

Workflow file: `.github/workflows/ci-release-assets.yml`

What it does:

1. Installs dependencies (`npm ci` in `core/`)
2. Runs lint + tests
3. Builds `dist` bundles
4. Smoke-tests built client/server exports
5. Packages release binaries:
   - `workout-planner-client-<tag>.tar.gz`
   - `workout-planner-server-<tag>.tar.gz`
   - `workout-planner-example-<tag>.tar.gz`
6. Uploads binaries as workflow artifacts
7. On `release.published` or manual dispatch, uploads binaries to the target GitHub release

Manual upload for an existing release tag:

1. Go to **Actions**
2. Run **CI and Release Assets** workflow
3. Enter `tag` (for example `v0.1.1`)

## Contributing

### Local setup

```bash
git clone https://github.com/tony-div/react-native-workout-planner.git
cd react-native-workout-planner/core
npm ci
```

### Branching and code changes

- Create a feature branch from `main`.
- Keep client-only code in `core/src/client` (no Node built-ins).
- Keep server-only code in `core/src/server`.
- Put shared contracts/utils in `core/src/shared`.

### Validation before PR

```bash
npm run lint
npm test
npm run build
```

### Tests

- `core/tests/server-handler.test.ts` covers Express + Gemma handler flow
- `core/tests/plan-generator.test.ts` covers plan parsing and validation failures
- `core/tests/client.test.ts` covers client fetch success/error handling

## Troubleshooting

- `Missing GEMINI_API_KEY`:
  - Ensure `.env` is loaded in your server process and key is present.
- React Native bundling error about server modules:
  - Import from `@react-native-workout-planner/client` only in RN app code.
- `No fetch implementation found`:
  - Pass `fetchImpl` in `ClientConfig` for non-standard runtime/test environments.
- Invalid JSON model errors:
  - Check Gemma response logs and ensure server prompt/schema has not been modified incorrectly.
