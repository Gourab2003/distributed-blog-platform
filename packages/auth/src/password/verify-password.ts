import bcrypt from 'bcryptjs';
import { InfrastructureError } from '@platform/errors';

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(plaintext, hash);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new InfrastructureError(`Failed to verify password: ${message}`);
    }
}