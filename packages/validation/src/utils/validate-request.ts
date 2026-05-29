import { z } from 'zod';
import { ValidationError } from '@platform/errors';

export function validateRequest<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    data: unknown,
): z.infer<TSchema> {
    const result = schema.safeParse(data);

    if (!result.success) {
        const firstIssue = result.error.issues[0];
        const message = firstIssue?.message ?? 'Validation failed';

        throw new ValidationError(message, {
            fieldErrors: result.error.flatten().fieldErrors,
        });
    }

    return result.data as z.infer<TSchema>;
}