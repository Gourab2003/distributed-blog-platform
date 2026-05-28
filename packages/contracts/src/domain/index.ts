export type EntityId = string;
export type ISODateString = string;

export type UserRole =

    | 'admin'
    | 'author'
    | 'user';

export type BlogPostStatus =

    | 'draft'
    | 'published'
    | 'archived';

export type SortDirection =

    | 'asc'
    | 'desc';
