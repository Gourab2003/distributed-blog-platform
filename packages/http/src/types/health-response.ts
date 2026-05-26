export type HealthStatus =
    | 'healthy'
    | 'degraded'
    | 'unhealthy';

export interface HealthCheckResult {
    readonly status: HealthStatus;
    readonly message?: string;
}

export interface HealthResponse {
    readonly status: HealthStatus;
    readonly service: string;
    readonly environment: string;
    readonly timestamp: string;
    readonly uptime: number;
    readonly checks?: Record<string, HealthCheckResult>;
}