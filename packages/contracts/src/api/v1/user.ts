import type { EntityId, ISODateString, UserRole } from '../../domain/index.js';

export interface CreateUserRequest {
    readonly email: string;
    readonly username: string;
    readonly password: string;
}

export interface UpdateUserRequest {
    readonly email?: string;
    readonly username?: string;
    readonly role?: UserRole;
}

export interface UserResponse {
    readonly id: EntityId;
    readonly email: string;
    readonly username: string;
    readonly role: UserRole;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
}
