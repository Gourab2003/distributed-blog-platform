import { AsyncLocalStorage } from 'node:async_hooks';
import type { TelemetryContext } from '../types/telemetry-context.js';

const storage = new AsyncLocalStorage<Readonly<TelemetryContext>>();

const EMPTY_CONTEXT = Object.freeze(
    {},
) as Readonly<TelemetryContext>;

export const runWithTelemetryContext = <T>(
    context: TelemetryContext,
    fn: () => T | Promise<T>,
): Promise<T> => {
    const current = getTelemetryContext();

    const merged = Object.freeze({
        ...current,
        ...context,
    }) as Readonly<TelemetryContext>;

    return Promise.resolve(storage.run(merged, fn));
};

export const setTelemetryContext = (
    context: Partial<TelemetryContext>,
): void => {
    const current = getTelemetryContext();

    const merged = Object.freeze({
        ...current,
        ...context,
    }) as Readonly<TelemetryContext>;

    storage.enterWith(merged);
};

export const getTelemetryContext = (): Readonly<TelemetryContext> => {
    return storage.getStore() ?? EMPTY_CONTEXT;
};