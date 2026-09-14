export interface RegisterInput {
  phone: string;
  username?: string;
  displayName: string;
  password: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
