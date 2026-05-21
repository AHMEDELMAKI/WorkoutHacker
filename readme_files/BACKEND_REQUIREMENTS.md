# Workout Hacker Backend Requirements

This document describes the backend capabilities implied by the current `src/` code. It is divided into:

1. Backend requirements that support the existing app without AI.
2. Additional backend / AI requirements for the `AI Coach` experience.

---

## 1. Backend Requirements (Non-AI)

### Current app architecture

- The current `src/` code stores all persisted data locally in `AsyncStorage` via `src/services/storage.ts`.
- There is no network or backend integration in `src/services/profileService.ts`, `workoutService.ts`, or `settingsService.ts`.
- The app is designed for local-only persistence today, but the UI and hooks can be adapted to remote APIs.

### Required backend capabilities

1. User account / authentication
   - `POST /auth/login`
   - `POST /auth/register`
   - `POST /auth/logout`
   - `GET /auth/me`
   - Token-based session support (JWT, bearer tokens, etc.)

2. Profile management
   - `GET /users/{userId}/profile`
   - `POST /users/{userId}/profile`
   - `PATCH /users/{userId}/profile`
   - `DELETE /users/{userId}/profile`

   Data shape should cover the app's profile state from `ProfileSetupState`.

3. Workout history storage
   - `GET /users/{userId}/workouts`
   - `GET /users/{userId}/workouts?range=this-week`
   - `POST /users/{userId}/workouts`
   - `PATCH /users/{userId}/workouts/{workoutId}`
   - `DELETE /users/{userId}/workouts/{workoutId}`

   Workout model should minimally include:
   - `id: string`
   - `title: string`
   - `type: string`
   - `date: string` (ISO)
   - `durationMin: number`
   - `calories: number`
   - `sets: { exercise: string; reps: number; weightKg: number; }[]`
   - optional `formScore` and `notes`

4. Settings/preferences
   - `GET /users/{userId}/settings`
   - `POST /users/{userId}/settings`
   - `PATCH /users/{userId}/settings`
   - `POST /users/{userId}/settings/reset`

   Settings model from `AppSettings`:
   - `notifications: boolean`
   - `darkMode: boolean`
   - `units: 'metric' | 'imperial'`
   - `language: string`
   - `privacyLocalOnly: boolean`
   - `privacyShareAnalytics: boolean`
   - `privacyCameraAccess: boolean`

5. Onboarding / app state
   - `GET /users/{userId}/onboarding`
   - `POST /users/{userId}/onboarding/done`

   This supports the local onboarding flag stored today as `wh:onboarding_done`.

### Optional backend features for basic app support

- Data sync across devices and restore from cloud
- Backup / restore of workouts, profile, and settings
- Basic analytics or usage metrics if privacy consent is granted
- Import/export workout logs

### Notes for implementation

- Replace the local `storage` service with a remote API wrapper without changing the UI hook contracts.
- Keep local caching so the app still works offline, with sync falling back gracefully.
- Ensure profile and settings are stored per authenticated user.

---

## 2. Backend + AI Requirements

The `AI Coach` screen currently renders static recommendations and uses local voice commands only. A real AI backend should provide the following.

### AI service endpoints

1. `POST /ai/coach/query`
   - Input:
     - `userId`
     - `prompt` or `question`
     - optional `context` fields such as recent workouts, fatigue state, goals, or user profile
   - Output:
     - AI answer text
     - optionally structured suggestions, actions, or follow-up recommendations

2. `GET /ai/coach/suggestions`
   - Input: `userId`
   - Output:
     - suggested exercises
     - weight adjustment recommendations
     - recovery advice
     - rest time guidance
     - summary metrics like rep quality and improvement trends

3. `GET /ai/coach/summary`
   - Input: `userId`
   - Output:
     - a dashboard summary of performance, fatigue, and training recommendations

4. Optional: `POST /ai/coach/session`
   - Save conversational history / coaching sessions
   - Support follow-up prompts and personalization

### AI input data sources

The AI backend should use data from:
- user profile data
- workout history and recent session logs
- weekly workout aggregation
- performance metrics such as form score and improvement trends
- user preferences and goals
- fatigue or recovery settings if available

### AI output models

The app UI currently renders these sections in `src/features/aiCoach/screens/AICoachScreen.tsx`:
- Suggested exercises
- Rest time suggestion
- Weight adjustments
- Recovery advice
- Quick stats: rep quality, workouts, improvement

Backend output should be compatible with these UI sections, including:
- `ExerciseSuggestion[]` with `id`, `name`, `description`, `icon`, `tag`
- `WeightSuggestion[]` with `id`, `exercise`, `delta`, `type`, `reason`
- `RecoveryAdvice[]` with `id`, `text`
- summary metrics such as `repQualityPercent`, `workoutCount`, `improvementPercent`

### Voice assistant integration

- The app uses `react-native-vosk` for local speech-to-text and emits actions via `src/services/voiceActionBus.ts`.
- Backend AI is not required for core voice recognition, but it should support natural-language coaching when the user says `ask coach`.
- Recommended flow:
  - local voice command → `ask_coach` action
  - app sends recognized user prompt to `POST /ai/coach/query`
  - backend returns coaching response text
  - app displays text and optionally uses TTS output via `src/services/ttsService.ts`

### AI-specific backend features

- Prompt orchestration to turn workout data into personalized coaching
- Integration with an LLM or specialized ML model
- Response caching or session management for repeated queries
- Analytics / model usage logging only if `privacyShareAnalytics` is allowed
- Optional hybrid mode for local AI inference vs. remote API

### Example AI response payload

```json
{
  "suggestions": [
    { "id": "ex1", "name": "Pike Push-ups", "description": "Your shoulders need more attention this week.", "icon": "body-outline", "tag": "Strength" }
  ],
  "weightAdjustments": [
    { "id": "w1", "exercise": "Bench Press", "delta": "+2.5 kg", "type": "increase", "reason": "You hit all reps with ease last session." }
  ],
  "recoveryAdvice": [
    { "id": "r1", "text": "Sleep 7–9 hours for optimal muscle repair." }
  ],
  "summary": {
    "repQuality": 92,
    "workoutCount": 24,
    "improvement": 18
  }
}
```

### Additional considerations

- The AI service should respect user privacy settings, especially `privacyLocalOnly` and `privacyShareAnalytics`.
- Build a clear mapping from local UI data models to backend response shapes so the screen can swap static arrays for remote data.
- Keep the AI coach backend loosely coupled: the UI should not depend on a hard-coded provider.

---

## 3. What is not currently required by `src/`

- There is no backend need for motion or sensor ingestion in `src/`; the app uses local voice and local TTS.
- There is no current backend integration for fatigue computation in the visible `src/` files.
- No current remote analytics or telemetry calls exist in `src/`.

---

## 4. Summary

The app currently expects local persistence only. Backend support should start with:
- profile CRUD
- workouts CRUD + weekly aggregation
- user settings storage
- authentication and per-user sync

For AI features, add:
- an AI coaching query endpoint
- suggestions/summary endpoint(s)
- proper use of profile/workout history as AI context
- voice prompt handling for the coach

This document is based on the `src/` files and the current app behavior in the repository.
