// Authentication related types and interfaces

export type Role = "FARM_MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string | null;
    image_url: string | null;
    createdAt: string;
  };
  roleChanged?: boolean;
  originalRole?: string;
  assignedRole?: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    image: string | null;
    image_url: string | null;
  };
  token: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  image?: File;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiError extends Error {
  response?: {
    data: ApiErrorResponse;
    status: number;
  };
}

export type AuthError = ApiErrorResponse | ApiError;
