export function encodeCursor(id: string, createdAt: string): string {
    const payload = JSON.stringify({ id, createdAt });
    return Buffer.from(payload, 'utf-8').toString('base64');
}