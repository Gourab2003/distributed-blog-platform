import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { AuthenticationError, InfrastructureError } from './errors.js';

export type UserRole = 'admin' | 'author' | 'user';

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

// ── Passwords ────────────────────────────────────────────────────────────────

export async function hashPassword(plaintext: string, rounds = 12): Promise<string> {
  try {
    return await bcrypt.hash(plaintext, rounds);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new InfrastructureError(`Failed to hash password: ${message}`, {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plaintext, hash);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new InfrastructureError(`Failed to verify password: ${message}`, {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

// ── JWT Access Tokens ────────────────────────────────────────────────────────

const VALID_ROLES: UserRole[] = ['admin', 'author', 'user'];

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
    VALID_ROLES.includes(record['role'] as UserRole) &&
    typeof record['iat'] === 'number' &&
    typeof record['exp'] === 'number'
  );
}

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
      expiresIn: options.expiresIn as any,
      issuer: options.issuer,
      audience: options.audience,
    });
  } catch (error: unknown) {
    throw new InfrastructureError('Failed to issue access token', {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

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
      throw error;
    }
    throw new AuthenticationError('Token verification failed due to an unexpected error');
  }
}

// ── Refresh Tokens ───────────────────────────────────────────────────────────

export function generateRefreshToken(): string {
  try {
    return randomBytes(64).toString('hex');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new InfrastructureError(`Failed to generate refresh token: ${message}`, {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

export async function hashRefreshToken(token: string): Promise<string> {
  try {
    return await bcrypt.hash(token, 12);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new InfrastructureError(`Failed to hash refresh token: ${message}`, {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

export async function verifyRefreshToken(plaintext: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plaintext, hash);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new InfrastructureError(`Failed to verify refresh token: ${message}`, {
      cause: error instanceof Error ? error : undefined,
    });
  }
}
