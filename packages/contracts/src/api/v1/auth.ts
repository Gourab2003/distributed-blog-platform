export interface LoginRequest {
    readonly email: string;
    readonly password: string;
}

export interface LoginResponse {
    readonly accessToken: string;
    readonly refreshToken: string;
}

export interface RefreshTokenRequest {
    readonly refreshToken: string;
}