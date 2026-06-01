import { z } from 'zod';
export declare const updateUserSchema: z.ZodEffects<z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "author", "user"]>>;
}, "strict", z.ZodTypeAny, {
    username?: string | undefined;
    role?: "admin" | "author" | "user" | undefined;
}, {
    username?: string | undefined;
    role?: "admin" | "author" | "user" | undefined;
}>, {
    username?: string | undefined;
    role?: "admin" | "author" | "user" | undefined;
}, {
    username?: string | undefined;
    role?: "admin" | "author" | "user" | undefined;
}>;
export declare const getUsersQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
//# sourceMappingURL=index.d.ts.map