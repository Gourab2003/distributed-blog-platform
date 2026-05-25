export type Environment =
    | 'development'
    | 'test'
    | 'staging'
    | 'production';

export interface LoggingConfiguration {
    readonly level: 'debug' | 'info' | 'warn' | 'error';
    readonly format: 'json' | 'pretty';
}

export interface ObservabilityConfiguration {
    readonly enabled: boolean;
    readonly serviceName: string;
    readonly sampleRate: number;
}

export interface DatabaseConfiguration {
    readonly url: string;
}

export interface RedisConfiguration {
    readonly url: string;
}

export interface SecretsConfiguration {
    readonly jwtSecret?: string;
}

export interface ServiceConfiguration {
    readonly service: string;
    readonly environment: Environment;

    readonly logging: LoggingConfiguration;
    readonly observability: ObservabilityConfiguration;

    readonly database: DatabaseConfiguration;
    readonly redis: RedisConfiguration;

    readonly secrets: SecretsConfiguration;
}