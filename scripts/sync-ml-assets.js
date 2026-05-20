const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appAssetsDir = path.join(root, 'android', 'app', 'src', 'main', 'assets');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, dest);
  return true;
}

function isLikely404Text(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const stat = fs.statSync(filePath);

  // Model files are big; only treat tiny text responses as likely 404s.
  if (stat.size > 64) return false;

  const text = fs.readFileSync(filePath, 'utf8').trim();
  return text.includes('404') || text.toLowerCase().includes('not found');
}

function assertValidModelFile(destPath, modelName) {
  if (isLikely404Text(destPath)) {
    throw new Error(
      `[sync-ml-assets] ${modelName} looks invalid (contains a 404 response or placeholder text). ` +
        `Replace it with the real model JSON in android/app/src/main/assets/ and re-run ` +
        `npm install (or: node scripts/sync-ml-assets.js). File: ${destPath}`,
    );
  }
}

function main() {
  ensureDir(appAssetsDir);

  const poseLiteSrc = path.join(
    root,
    'node_modules',
    'react-native-pose-landmarks',
    'example',
    'android',
    'app',
    'src',
    'main',
    'assets',
    'pose_landmarker_lite.task',
  );
  const poseFullSrc = path.join(
    root,
    'node_modules',
    'react-native-pose-landmarks',
    'example',
    'android',
    'app',
    'src',
    'main',
    'assets',
    'pose_landmarker_full.task',
  );
  const exerciseSrc = path.join(
    root,
    'node_modules',
    'react-native-exercise-recognition',
    'example',
    'android',
    'app',
    'src',
    'main',
    'assets',
    'exercise_classifier_rf.json',
  );

  const poseLiteDest = path.join(appAssetsDir, 'pose_landmarker_lite.task');
  const poseFullDest = path.join(appAssetsDir, 'pose_landmarker_full.task');
  const exerciseDest = path.join(appAssetsDir, 'exercise_classifier_rf.json');
  const tempoDest = path.join(appAssetsDir, 'tempo_classifier.json');

  copyIfExists(poseLiteSrc, poseLiteDest);
  copyIfExists(poseFullSrc, poseFullDest);

  // IMPORTANT:
  // android/app/src/main/assets/exercise_classifier_rf.json may be provided manually by the app.
  // The library's example sometimes ships a placeholder 404 response; we must not overwrite a valid local model.
  if (fs.existsSync(exerciseDest) && !isLikely404Text(exerciseDest)) {
    console.log('[sync-ml-assets] Keeping existing valid exercise_classifier_rf.json in app assets.');
  } else {
    copyIfExists(exerciseSrc, exerciseDest);
  }

  const missing = [];
  if (!fs.existsSync(poseLiteDest)) missing.push('pose_landmarker_lite.task');
  if (!fs.existsSync(exerciseDest)) missing.push('exercise_classifier_rf.json');
  if (!fs.existsSync(tempoDest)) missing.push('tempo_classifier.json');

  if (missing.length > 0) {
    throw new Error(`[sync-ml-assets] Missing required asset(s): ${missing.join(', ')}`);
  }

  // Hard-fail so you never hit the runtime "model failed to load" path.
  assertValidModelFile(exerciseDest, 'exercise_classifier_rf.json');
  assertValidModelFile(tempoDest, 'tempo_classifier.json');
}

main();
