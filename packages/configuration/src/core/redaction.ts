const SENSITIVE_KEYS = new Set([
    'secret',
    'password',
    'token',
    'key',
    'credential',
    'auth',
    'private',
]);

const redactValue = (
    value: unknown,
): unknown => {
    if (typeof value === 'string') {
        return '[REDACTED]';
    }

    if (
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return '[REDACTED]';
    }

    return value;
};

export const redactSecrets = (
    value: unknown,
): unknown => {
    if (
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(redactSecrets);
    }

    if (typeof value === 'object') {
        const redacted: Record<
            string,
            unknown
        > = {};

        for (const [key, val] of Object.entries(
            value,
        )) {
            const lowerKey = key.toLowerCase();

            redacted[key] = SENSITIVE_KEYS.has(
                lowerKey,
            )
                ? redactValue(val)
                : redactSecrets(val);
        }

        return redacted;
    }

    return value;
};

export const safeSerializeConfiguration = (
    config: unknown,
): string => {
    const redacted = redactSecrets(config);

    return JSON.stringify(
        redacted,
        null,
        2,
    );
};