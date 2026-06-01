import { ValidationError } from '@platform/errors';
export function validateRequest(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const firstIssue = result.error.issues[0];
        const message = firstIssue?.message ?? 'Validation failed';
        throw new ValidationError(message, {
            fieldErrors: result.error.flatten().fieldErrors,
        });
    }
    return result.data;
}
//# sourceMappingURL=validate-request.js.map