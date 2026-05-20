import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ClientConfig, ServerConfig } from '../shared/types';

export interface InitEnvOptions {
  outputPath?: string;
  overwrite?: boolean;
}

const DEFAULT_ENV_TEMPLATE = ['GEMINI_API_KEY=your_gemini_api_key_here', 'API_BASE_URL=http://localhost:3000'].join(
  '\n',
);

export function createServerConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const geminiApiKey = env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  return { geminiApiKey, geminiModel: env.GEMINI_MODEL };
}

export function createClientConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ClientConfig {
  const apiBaseUrl = env.API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('Missing API_BASE_URL environment variable');
  }
  return { apiBaseUrl };
}

export function getEnvTemplate(): string {
  return `${DEFAULT_ENV_TEMPLATE}\n`;
}

export function initializeEnvFile(options: InitEnvOptions = {}): string {
  const outputPath = resolve(process.cwd(), options.outputPath ?? '.env.example');

  if (!options.overwrite) {
    try {
      writeFileSync(outputPath, getEnvTemplate(), { encoding: 'utf8', flag: 'wx' });
      return outputPath;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EEXIST') {
        throw new Error(`File already exists at ${outputPath}. Pass overwrite=true to replace it.`);
      }
      throw error;
    }
  }

  writeFileSync(outputPath, getEnvTemplate(), { encoding: 'utf8' });
  return outputPath;
}
