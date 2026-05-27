import type { TelemetryContext } from './telemetry-context.js';

export interface TracingProvider {
    getContext(): Readonly<TelemetryContext>;

    runWithContext<T>(
        context: TelemetryContext,
        fn: () => T | Promise<T>,
    ): Promise<T>;
}