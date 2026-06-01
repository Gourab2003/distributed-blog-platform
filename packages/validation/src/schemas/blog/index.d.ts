import { z } from 'zod';
export declare const createBlogPostSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    summary: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    title: string;
    content: string;
    summary?: string | undefined;
    tags?: string[] | undefined;
}, {
    title: string;
    content: string;
    summary?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const updateBlogPostSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodEnum<["draft", "published", "archived"]>>;
}, "strict", z.ZodTypeAny, {
    status?: "draft" | "published" | "archived" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    summary?: string | undefined;
    tags?: string[] | undefined;
}, {
    status?: "draft" | "published" | "archived" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    summary?: string | undefined;
    tags?: string[] | undefined;
}>, {
    status?: "draft" | "published" | "archived" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    summary?: string | undefined;
    tags?: string[] | undefined;
}, {
    status?: "draft" | "published" | "archived" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    summary?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const getBlogPostsQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
} & {
    authorId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["draft", "published", "archived"]>>;
    tag: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    status?: "draft" | "published" | "archived" | undefined;
    cursor?: string | undefined;
    authorId?: string | undefined;
    tag?: string | undefined;
}, {
    status?: "draft" | "published" | "archived" | undefined;
    cursor?: string | undefined;
    limit?: number | undefined;
    authorId?: string | undefined;
    tag?: string | undefined;
}>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type GetBlogPostsQueryInput = z.infer<typeof getBlogPostsQuerySchema>;
//# sourceMappingURL=index.d.ts.map