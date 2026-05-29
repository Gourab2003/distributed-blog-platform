import bcrypt from 'bcryptjs';
import { InfrastructureError } from '@platform/errors';

export async function hashPassword(plaintext: string, rounds = 12): Promise<string> {
    try {
        return await bcrypt.hash(plaintext, rounds);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new InfrastructureError(`Failed to hash password: ${message}`);
    }
}