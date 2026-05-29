import type { AccessTokenClaims } from '../types/token-types.js';

const VALID_ROLES = ['admin', 'author', 'user'] as const;

export function isAccessTokenClaims(claims: unknown): claims is AccessTokenClaims {
    if (typeof claims !== 'object' || claims === null) {
        return false;
    }

    const record = claims as Record<string, unknown>;

    return (
        record['type'] === 'access' &&
        typeof record['sub'] === 'string' &&
        typeof record['email'] === 'string' &&
        typeof record['role'] === 'string' &&
        VALID_ROLES.includes(record['role'] as (typeof VALID_ROLES)[number]) &&
        typeof record['iat'] === 'number' &&
        typeof record['exp'] === 'number'
    );
}