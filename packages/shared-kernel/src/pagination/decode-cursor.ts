export function decodeCursor(cursor: string): { readonly id: string; readonly createdAt: string } {
    try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded) as unknown;

        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Invalid pagination cursor: payload is not a valid object.');
        }

        // Type assertion is necessary here since we lack Zod and have verified it's a non-null object
        const record = parsed as Record<string, unknown>;

        if (typeof record.id !== 'string') {
            throw new Error('Invalid pagination cursor: missing or invalid identifier.');
        }

        if (typeof record.createdAt !== 'string') {
            throw new Error('Invalid pagination cursor: missing or invalid creation date.');
        }

        return {
            id: record.id,
            createdAt: record.createdAt,
        };
    } catch (error: unknown) {
        if (error instanceof Error && error.message.startsWith('Invalid pagination cursor')) {
            throw error;
        }
        throw new Error('Invalid pagination cursor: malformed base64 payload.');
    }
}