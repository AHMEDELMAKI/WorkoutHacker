"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerConfigFromEnv = createServerConfigFromEnv;
exports.createClientConfigFromEnv = createClientConfigFromEnv;
exports.getEnvTemplate = getEnvTemplate;
exports.initializeEnvFile = initializeEnvFile;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const DEFAULT_ENV_TEMPLATE = `GEMINI_API_KEY=your_gemini_api_key_here
API_BASE_URL=http://localhost:3000`;
function createServerConfigFromEnv(env = process.env) {
    const geminiApiKey = env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    return { geminiApiKey, geminiModel: env.GEMINI_MODEL };
}
function createClientConfigFromEnv(env = process.env) {
    const apiBaseUrl = env.API_BASE_URL;
    if (!apiBaseUrl) {
        throw new Error('Missing API_BASE_URL environment variable');
    }
    return { apiBaseUrl };
}
function getEnvTemplate() {
    return `${DEFAULT_ENV_TEMPLATE}
`;
}
function initializeEnvFile(options = {}) {
    const outputPath = (0, node_path_1.resolve)(process.cwd(), options.outputPath ?? '.env.example');
    if (!options.overwrite) {
        try {
            (0, node_fs_1.writeFileSync)(outputPath, getEnvTemplate(), { encoding: 'utf8', flag: 'wx' });
            return outputPath;
        }
        catch (error) {
            const err = error;
            if (err.code === 'EEXIST') {
                throw new Error(`File already exists at ${outputPath}. Pass overwrite=true to replace it.`);
            }
            throw error;
        }
    }
    (0, node_fs_1.writeFileSync)(outputPath, getEnvTemplate(), { encoding: 'utf8' });
    return outputPath;
}
//# sourceMappingURL=config.js.map