export const DEFAULT_SENSITIVE_FIELDS =
    new Set<string>([
        'authorization',
        'cookie',
        'set-cookie',

        'password',
        'secret',

        'token',
        'accesstoken',
        'refreshtoken',

        'apikey',
        'api-key',
        'x-api-key',

        'privatekey',
        'credential',
    ]);