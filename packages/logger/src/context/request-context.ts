import { AsyncLocalStorage } from 'node:async_hooks';

import type { LogContext } from '../types/log-context.js';

const requestContextStorage =
    new AsyncLocalStorage<Readonly<LogContext>>();

export const runWithRequestContext = async <T>(
    context: LogContext,
    operation: () => Promise<T>,
): Promise<T> => {
    const currentContext = getRequestContext();

    const mergedContext: Readonly<LogContext> = {
        ...currentContext,
        ...context,
    };

    return requestContextStorage.run(
        mergedContext,
        operation,
    );
};

export const getRequestContext = ():
    Readonly<LogContext> => {
    return requestContextStorage.getStore() ?? {};
};