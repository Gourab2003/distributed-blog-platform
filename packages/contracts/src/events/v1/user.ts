import type { EntityId, ISODateString, UserRole } from '../../domain/index.js';

export interface UserCreatedEventPayload {
    readonly id: EntityId;
    readonly email: string;
    readonly username: string;
    readonly role: UserRole;
    readonly createdAt: ISODateString;
}

export interface UserUpdatedEventPayload {
    readonly id: EntityId;
    readonly email: string;
    readonly username: string;
    readonly role: UserRole;
    readonly updatedAt: ISODateString;
}

export interface UserDeletedEventPayload {
    readonly id: EntityId;
    readonly email: string;
    readonly deletedAt: ISODateString;
}
