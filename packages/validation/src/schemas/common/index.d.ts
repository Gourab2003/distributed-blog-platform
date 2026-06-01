import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const isoDataSchema: z.ZodString;
export declare const cursorSchema: z.ZodString;
export declare const limitSchema: z.ZodDefault<z.ZodNumber>;
export declare const cursorPaginationSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const BLOG_POST_STATUSES: readonly ["draft", "published", "archived"];
export declare const blogPostStatusSchema: z.ZodEnum<["draft", "published", "archived"]>;
export declare const USER_ROLES: readonly ["admin", "author", "user"];
export declare const userRoleSchema: z.ZodEnum<["admin", "author", "user"]>;
//# sourceMappingURL=index.d.ts.map