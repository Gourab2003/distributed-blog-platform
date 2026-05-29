import jwt from 'jsonwebtoken';
import { InfrastructureError } from '@platform/errors';
import type { IssueAccessTokenOptions, AccessTokenClaims } from '../types/token-types.js';

export function issueAccessToken(options: IssueAccessTokenOptions): string {
    try {
        const payload: Omit<AccessTokenClaims, 'iat' | 'exp'> = {
            sub: options.userId,
            email: options.email,
            role: options.role,
            type: 'access',
        };

        return jwt.sign(payload, options.secret, {
            algorithm: 'HS256',
            expiresIn: options.expiresIn,
            issuer: options.issuer,
            audience: options.audience,
        } as jwt.SignOptions);
    } catch (error: unknown) {
        throw new InfrastructureError('Failed to issue access token', {
            cause: error instanceof Error ? error.message : String(error),
        });
    }
}