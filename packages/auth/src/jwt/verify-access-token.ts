import jwt from 'jsonwebtoken';
import { AuthenticationError } from '@platform/errors';
import { isAccessTokenClaims } from './token-claims.js';
import type { VerifyAccessTokenOptions, AccessTokenClaims } from '../types/token-types.js';

export function verifyAccessToken(options: VerifyAccessTokenOptions): AccessTokenClaims {
    try {
        const decoded = jwt.verify(options.token, options.secret, {
            issuer: options.issuer,
            audience: options.audience,
        });

        if (!isAccessTokenClaims(decoded)) {
            throw new AuthenticationError('Access token claims are malformed');
        }

        return decoded;
    } catch (error: unknown) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AuthenticationError('Access token has expired');
        }

        if (error instanceof jwt.NotBeforeError) {
            throw new AuthenticationError('Access token is not yet valid');
        }

        if (error instanceof jwt.JsonWebTokenError) {
            throw new AuthenticationError('Access token is invalid');
        }

        if (error instanceof AuthenticationError) {
            throw error; // Re-throw our custom malformed claims error
        }

        throw new AuthenticationError('Token verification failed due to an unexpected error');
    }
}