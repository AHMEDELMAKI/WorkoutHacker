# Agent Notes

## Scope and working directory
- This repo is **not** a JS workspace; treat `core/` and `example/` as separate npm projects with their own `package-lock.json` files.
- Do most library work from `core/`; root `package.json` is a placeholder and its `npm test` intentionally fails.

## Verified commands (core)
- Install: `cd core && npm ci`
- Lint: `cd core && npm run lint`
- Test (all): `cd core && npm test`
- Test (single file): `cd core && npx jest tests/client.test.ts --runInBand`
- Build: `cd core && npm run build`
- CI order in `.github/workflows/ci-release-assets.yml`: `lint -> test -> build`, then smoke checks on built exports and packaged tarballs.

## Package boundaries that matter
- Library source of truth is `core/src` with strict split:
  - client-only API: `core/src/client/index.ts`
  - server-only API: `core/src/server/index.ts`
  - shared contracts/utilities: `core/src/shared/*`
- Keep environment boundaries strict: React Native code should import `@react-native-workout-planner/client`; server code should import `@react-native-workout-planner/server`.

## Runtime and contract gotchas
- Server config hard-requires `GEMINI_API_KEY` (`createServerConfigFromEnv` throws if missing).
- Client config hard-requires `API_BASE_URL` when using env helpers (`createClientConfigFromEnv` throws if missing).
- `generatePlan` defaults endpoint to `/api/workout` and throws if no fetch implementation is available.
- Request normalization applies defaults (goal, level, equipment, trainingAge) in `core/src/shared/normalize.ts`; preserve these semantics when changing request handling.

## Example app realities
- Example server entrypoint: `example/server/index.js`; API endpoint is `POST /api/workout`, health endpoint is `GET /health`.
- Example app uses emulator-aware base URL logic in `example/App.tsx` (`10.0.2.2` for Android, `localhost` for iOS).
- `example/package.json` does **not** define `sync:bundles` even though `example/README.md` references it; trust scripts in `example/package.json`.

## Style/tooling constraints
- `core` lint rule forbids `any` (`@typescript-eslint/no-explicit-any: error`).
- `core` build uses `tsconfig.build.json` and excludes tests; only `src/` is emitted to `core/dist`.
