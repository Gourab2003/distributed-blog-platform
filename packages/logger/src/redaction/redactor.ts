import {
    DEFAULT_SENSITIVE_FIELDS,
} from './default-sensitive-fields.js';

const DEFAULT_CENSOR = '[REDACTED]';

const MAX_RECURSION_DEPTH = 8;

export interface RedactionOptions {
    readonly enabled: boolean;
    readonly fields: ReadonlySet<string>;
    readonly censor: string;
}

const normalizeFieldName = (
    value: string,
): string => {
    return value
        .toLowerCase()
        .replace(/[^a-z]/g, '');
};

export const createRedactor = (
    options: RedactionOptions,
) => {
    const redactValue = (
        value: unknown,
        depth: number = 0,
    ): unknown => {
        if (depth > MAX_RECURSION_DEPTH) {
            return '[MAX_DEPTH_EXCEEDED]';
        }

        if (
            value === null ||
            value === undefined ||
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map((item) =>
                redactValue(item, depth + 1),
            );
        }

        if (typeof value === 'object') {
            const result: Record<string, unknown> = {};

            for (const [key, nestedValue] of Object.entries(value)) {
                const normalizedKey =
                    normalizeFieldName(key);

                const isSensitive =
                    options.fields.has(normalizedKey) ||
                    DEFAULT_SENSITIVE_FIELDS.has(normalizedKey);

                result[key] = isSensitive
                    ? options.censor
                    : redactValue(nestedValue, depth + 1);
            }

            return result;
        }

        return String(value);
    };

    return {
        redact: (value: unknown): unknown => {
            if (!options.enabled) {
                return value;
            }

            return redactValue(value);
        },
    };
};

export const createDefaultRedactionOptions =
    (): RedactionOptions => {
        return {
            enabled: true,
            fields: new Set<string>(),
            censor: DEFAULT_CENSOR,
        };
    };