export interface CreateBlogPostRequest {
    readonly title: string;
    readonly content: string;
}

export interface BlogPostResponse {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly authorId: string;
    readonly createdAt: string;
}