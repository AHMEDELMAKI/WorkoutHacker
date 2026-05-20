#!/usr/bin/env node

import { initializeEnvFile } from './config';

function run(): void {
  const outputPathArg = process.argv[2];
  const overwrite = process.argv.includes('--overwrite');

  try {
    const path = initializeEnvFile({ outputPath: outputPathArg, overwrite });
    process.stdout.write(`Environment template created at ${path}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown CLI error';
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}

run();
