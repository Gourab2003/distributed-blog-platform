import type {
    HealthCheckResult,
    HealthResponse,
    HealthStatus,
} from '../types/health-response.js';

interface CreateHealthResponseOptions {
    readonly service: string;
    readonly environment: string;
    readonly uptime: number;
    readonly checks?: Record<string, HealthCheckResult>;
}

const resolveOverallStatus = (
    checks?: Record<string, HealthCheckResult>,
): HealthStatus => {
    if (!checks || Object.keys(checks).length === 0) {
        return 'healthy';
    }

    const values = Object.values(checks);

    if (values.some((check) => check.status === 'unhealthy')) {
        return 'unhealthy';
    }

    if (values.some((check) => check.status === 'degraded')) {
        return 'degraded';
    }

    return 'healthy';
};

export const createHealthResponse = (
    options: CreateHealthResponseOptions,
): HealthResponse => {
    return {
        status: resolveOverallStatus(options.checks),
        service: options.service,
        environment: options.environment,
        timestamp: new Date().toISOString(),
        uptime: options.uptime,
        ...(options.checks ? { checks: options.checks } : {}),
    };
};