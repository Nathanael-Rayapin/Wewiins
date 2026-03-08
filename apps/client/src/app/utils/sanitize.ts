export function sanitize(value: string): string {
    return value
        .toLowerCase()
        .replace(/[@.&]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/[^a-z0-9_-]/g, '');
}