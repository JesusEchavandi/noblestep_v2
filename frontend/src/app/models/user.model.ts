export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
  expiresAt: Date;
}
