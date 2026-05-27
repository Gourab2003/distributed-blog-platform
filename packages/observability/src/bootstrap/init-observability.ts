import type { ObservabilityOptions } from '../types/observability-options.js';

import type { ObservabilityRuntime } from '../types/observability-runtime.js';

/**
 * Future responsibilities:
 * - OpenTelemetry bootstrap
 * - Metrics exporter registration
 * - Global propagation configuration
 * - Runtime instrumentation lifecycle
 */


export const initObservability = (
    options: ObservabilityOptions,
): ObservabilityRuntime => {
    options.logger.info(
        'Observability runtime initialized',
        {
            metadata: {
                serviceName: options.serviceName,
                environment: options.environment,
            },
        },
    );

    return {
        shutdown: async () => {
            options.logger.info(
                'Shutting down observability runtime',
            );
        },
    };
};