import { randomBytes } from 'node:crypto';
import { InfrastructureError } from '@platform/errors';

export function generateRefreshToken(): string {
    try {
        return randomBytes(64).toString('hex');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new InfrastructureError(`Failed to generate refresh token: ${message}`);
    }
}