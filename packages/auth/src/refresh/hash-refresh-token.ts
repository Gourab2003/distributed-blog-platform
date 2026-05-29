import bcrypt from 'bcryptjs';
import { InfrastructureError } from '@platform/errors';

export async function hashRefreshToken(token: string): Promise<string> {
    try {
        return await bcrypt.hash(token, 12);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new InfrastructureError(`Failed to hash refresh token: ${message}`);
    }
}

export async function verifyRefreshToken(plaintext: string, hash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(plaintext, hash);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new InfrastructureError(`Failed to verify refresh token: ${message}`);
    }
}