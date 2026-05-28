export interface TokenPair {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
}

export interface LoginRequest {
    readonly email: string;
    readonly password: string;
}

export interface LoginResponse extends TokenPair { }

export interface RegisterRequest {
    readonly email: string;
    readonly username: string;
    readonly password: string;
}

export interface RegisterResponse extends TokenPair { }

export interface RefreshTokenRequest {
    readonly refreshToken: string;
}

export interface RefreshTokenResponse extends TokenPair { }

export interface LogoutRequest {
    readonly refreshToken: string;
}
