export function nowUtcIso(): string {
    return new Date().toISOString();
}

export function isExpired(expiresAt: string | Date): boolean {
    const expirationDate =
        typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    return expirationDate.getTime() < Date.now();
}

export function addSeconds(date: Date, seconds: number): Date {
    const result = new Date(date.getTime());
    result.setSeconds(result.getSeconds() + seconds);
    return result;
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
}