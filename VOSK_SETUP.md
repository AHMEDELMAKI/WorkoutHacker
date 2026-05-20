# Vosk Voice Recognition Setup Guide

## Overview

Vosk is integrated as a global voice recognition service in this React Native app. It initializes at app startup and handles voice commands globally across all screens.

## Current Setup Status ✓

- ✓ GlobalVoiceController component (initialized at app root level)
- ✓ Vosk model files: `android/app/src/main/assets/vosk-model-small-en-us-0.15/`
- ✓ Vosk service with full error handling and logging
- ✓ Voice commands mapped in GlobalVoiceController

## Architecture

### Component Hierarchy

```
App.tsx
├── GlobalVoiceController (OUTER WRAPPER - App root level)
└── SafeAreaProvider
    └── AppNavigator
        └── GlobalVoiceController (INNER - Navigation level backup)
```

### Initialization Flow

1. **App starts** → GlobalVoiceController mounts (App.tsx level)
2. **Request mic permission** → ensureMicPermission()
3. **Load Vosk model** → ensureVoskModel() (loads from assets)
4. **Start listening** → startVosk()
5. **Subscribe to results** → subscribeVoskResults()

## Voice Commands Supported

All commands are case-insensitive and can include variations:

| Command | Action |
|---------|--------|
| "go to home" / "open home" | Navigate to Home |
| "go to workout" / "open workout" | Navigate to Workout |
| "go to progress" / "open progress" | Navigate to Progress |
| "go to profile" / "open profile" | Navigate to Profile |
| "go to ai coach" / "open ai coach" | Navigate to AI Coach |
| "start workout" / "press start workout" | Emit home_start_workout event |
| "check fatigue" / "fatigue level" | Emit home_check_fatigue event |
| "ask coach" / "press ask coach" | Emit ask_coach event |
| "open pike push ups" / "pike pushups" | Emit open_pike_pushups event |
| "open romanian deadlifts" | Emit open_romanian_deadlifts event |
| "open face pulls" | Emit open_face_pulls event |

## Troubleshooting

### 1. Model Not Found Error

**Error Message:** "Vosk model previously failed to load"

**Solutions:**
- Verify model exists: `android/app/src/main/assets/vosk-model-small-en-us-0.15/`
- Check model contents: `conf/`, `graph/`, `ivector/`, `am/`, `README`
- Rebuild app: `npm run build-android`
- Clear app data: `adb shell pm clear com.workouthackerv2`

### 2. Microphone Permission Denied

**Alert:** "Microphone Permission Required"

**Solutions:**
- Grant microphone permission when prompt appears
- Manually enable: Settings → App Permissions → Microphone → Allow
- Restart the app after granting permission

### 3. Voice Not Responding

**Check logs:**
```bash
adb logcat | grep -E "\[Vosk\]|\[GlobalVoiceController\]"
```

**Expected log sequence:**
```
[GlobalVoiceController] Starting setup
[Vosk] Loading model: vosk-model-small-en-us-0.15
[Vosk] Model loaded successfully
[GlobalVoiceController] Starting Vosk
[Vosk] Starting voice recognition
[Vosk] Voice recognition started
[GlobalVoiceController] Voice control initialized successfully
```

**If stuck at any step:**
1. Stop the app
2. Clear app data: `adb shell pm clear com.workouthackerv2`
3. Rebuild and reinstall the app

### 4. Partial Model Files

**Verify all model files exist:**
```bash
find android/app/src/main/assets/vosk-model-small-en-us-0.15 -type f | wc -l
```

Should be several hundred files across subdirectories.

## Debugging with Logs

### Enable Full Logging

The system logs all Vosk operations with prefixes:
- `[Vosk]` - Core service operations
- `[GlobalVoiceController]` - Component lifecycle

### Filter Logs

```bash
# Show only Vosk logs
adb logcat | grep "\[Vosk\]"

# Show Vosk and GlobalVoiceController logs
adb logcat | grep -E "\[Vosk\]|\[GlobalVoiceController\]"

# Save logs to file
adb logcat | grep "\[Vosk\]" > vosk_debug.log
```

## Rebuild Instructions

### Clean Build
```bash
# Clear gradlew cache and rebuild
cd android
./gradlew clean
./gradlew build
cd ..
npm start -- --android
```

### Release Build
```bash
npm run build-android-release
```

## File Locations Reference

| File | Purpose |
|------|---------|
| `src/services/voskService.ts` | Core Vosk service and model loading |
| `src/components/GlobalVoiceController.tsx` | Voice command listener and router |
| `src/services/voiceActionBus.ts` | Voice action event emitter |
| `android/app/src/main/assets/vosk-model-small-en-us-0.15/` | Vosk model data |
| `src/types/react-native-vosk.d.ts` | TypeScript definitions |

## API Reference

### voskService.ts Functions

```typescript
// Request microphone permission
await ensureMicPermission(): Promise<boolean>

// Load and cache Vosk model
await ensureVoskModel(): Promise<void>

// Start voice recognition
await startVosk(): Promise<void>

// Stop voice recognition
await stopVosk(): Promise<void>

// Subscribe to recognition results
subscribeVoskResults(onResult: (text: string) => void): () => void

// Check if model is loaded
isModelLoaded(): boolean

// Get model load error (if any)
getModelLoadError(): string | null
```

## Advanced: Adding New Voice Commands

1. Edit `src/components/GlobalVoiceController.tsx`
2. Add new command check in the `subscribeVoskResults` callback:

```typescript
if (command.includes('your command phrase')) {
  emitVoiceAction('your_action_name');
  return;
}
```

3. Or dispatch custom actions directly:
```typescript
if (command.includes('custom command')) {
  navigateRoot('ScreenName', { params } as never);
  return;
}
```

## Performance Notes

- Model loads once and is cached in memory
- Subscription persists across screen navigation
- Results throttled naturally by Vosk speech recognition rate
- No performance impact when mic is inactive
- Minimal battery impact in normal usage

## Support

For issues, check:
1. Android logcat for error messages
2. Model file integrity (all files present)
3. Rebuild app after file changes
4. Microphone permissions in Settings
