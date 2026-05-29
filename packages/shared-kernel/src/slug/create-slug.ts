export function createSlug(input: string): string {
    const processed = input
        .toLowerCase()
        .trim()
        .normalize('NFKD')
        // Strip non-ASCII characters
        .replace(/[^\x00-\x7F]/g, '')
        // Replace all non-alphanumeric characters with hyphens
        .replace(/[^a-z0-9]+/g, '-')
        // Collapse consecutive hyphens into a single hyphen
        .replace(/-+/g, '-')
        // Trim leading and trailing hyphens
        .replace(/^-+|-+$/g, '');

    // Enforce max length of 200 and remove trailing hyphen if truncated
    const truncated = processed.substring(0, 200).replace(/-+$/g, '');

    if (truncated.length === 0) {
        throw new Error('Cannot generate slug from empty input.');
    }

    return truncated;
}