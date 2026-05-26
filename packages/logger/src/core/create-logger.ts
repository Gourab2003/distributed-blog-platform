import winston from 'winston';

import {
    getRequestContext,
} from '../context/request-context.js';

import {
    createDefaultRedactionOptions,
    createRedactor,
} from '../redaction/redactor.js';

import {
    serializeError,
} from '../serializers/error-serializer.js';

import type {
    LogContext,
    LoggerOptions,
    PlatformLogger,
} from '../types/index.js';

import {
    createJsonFormatter,
} from '../formatters/json-formatter.js';

const LOG_LEVEL_MAP: Record<
    LoggerOptions['level'],
    string
> = {
    trace: 'silly',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
    fatal: 'error'
};

export const createLogger = (
    options: LoggerOptions,
): PlatformLogger => {
    const redactionOptions =
        createDefaultRedactionOptions();

    const mergedFields = new Set<string>([
        ...redactionOptions.fields,
        ...(options.redaction?.fields ?? []),
    ]);

    const redactor = createRedactor({
        enabled:
            options.redaction?.enabled ??
            redactionOptions.enabled,

        censor:
            options.redaction?.censor ??
            redactionOptions.censor,

        fields: mergedFields,
    });

    const winstonLogger =
        winston.createLogger({
            level:
                LOG_LEVEL_MAP[options.level],

            defaultMeta: {
                service: options.serviceName,
                environment: options.environment,
            },

            format: createJsonFormatter(),

            transports: [
                new winston.transports.Console(),
            ],
        });

    const createContextualLogger = (
        baseContext: LogContext = {},
    ): PlatformLogger => {
        const writeLog = (
            level: string,
            message: string,
            error?: unknown,
            context?: LogContext,
        ): void => {
            const requestContext =
                getRequestContext();

            const mergedContext = {
                ...requestContext,
                ...baseContext,
                ...context,
            };

            const payload = {
                ...mergedContext,

                ...(error
                    ? {
                        error:
                            serializeError(error),
                    }
                    : {}),
            };

            const sanitizedPayload =
                redactor.redact(payload);

            winstonLogger.log({
                level,
                message,
                ...(
                    sanitizedPayload as Record<
                        string,
                        unknown
                    >
                ),
            });
        };

        return {
            trace: (
                message,
                context,
            ) => {
                writeLog(
                    'silly',
                    message,
                    undefined,
                    context,
                );
            },

            debug: (
                message,
                context,
            ) => {
                writeLog(
                    'debug',
                    message,
                    undefined,
                    context,
                );
            },

            info: (
                message,
                context,
            ) => {
                writeLog(
                    'info',
                    message,
                    undefined,
                    context,
                );
            },

            warn: (
                message,
                context,
            ) => {
                writeLog(
                    'warn',
                    message,
                    undefined,
                    context,
                );
            },

            error: (
                message,
                error,
                context,
            ) => {
                writeLog(
                    'error',
                    message,
                    error,
                    context,
                );
            },

            fatal: (
                message,
                error,
                context,
            ) => {
                writeLog(
                    'error',
                    message,
                    error,
                    context,
                );
            },

            withContext: (
                context,
            ) => {
                return createContextualLogger({
                    ...baseContext,
                    ...context,
                });
            },
        };
    };

    return createContextualLogger();
};