import type { UserRole } from '@platform/contracts';

export type TokenType = 'access';

export interface AccessTokenClaims {
    readonly sub: string;
    readonly email: string;
    readonly role: UserRole;
    readonly type: 'access';
    readonly iat: number;
    readonly exp: number;
}

export interface IssueAccessTokenOptions {
    readonly userId: string;
    readonly email: string;
    readonly role: UserRole;
    readonly secret: string;
    readonly expiresIn: string;
    readonly issuer: string;
    readonly audience: string;
}

export interface VerifyAccessTokenOptions {
    readonly token: string;
    readonly secret: string;
    readonly issuer: string;
    readonly audience: string;
}