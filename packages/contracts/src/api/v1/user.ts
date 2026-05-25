export interface CreateUserRequest {
    readonly email: string;
    readonly username: string;
    readonly password: string;
}

export interface UserResponse {
    readonly id: string;
    readonly email: string;
    readonly username: string;
    readonly createdAt: string;
}