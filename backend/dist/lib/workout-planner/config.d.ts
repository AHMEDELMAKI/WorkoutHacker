import type { ClientConfig, ServerConfig } from './shared/types';
export interface InitEnvOptions {
    outputPath?: string;
    overwrite?: boolean;
}
export declare function createServerConfigFromEnv(env?: NodeJS.ProcessEnv): ServerConfig;
export declare function createClientConfigFromEnv(env?: NodeJS.ProcessEnv): ClientConfig;
export declare function getEnvTemplate(): string;
export declare function initializeEnvFile(options?: InitEnvOptions): string;
//# sourceMappingURL=config.d.ts.map