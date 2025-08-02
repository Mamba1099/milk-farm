import { ReactNode } from "react";

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

export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFarmManager: boolean;
  isEmployee: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canEdit: boolean;
  canView: boolean;
}

export interface LoginError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export type AuthError = ApiErrorResponse | ApiError;

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string | string[];
  fallbackPath?: string;
  showLoading?: boolean;
}

export interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string | string[];
  fallback?: ReactNode;
}

export interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  isAuthError: boolean;
}

export interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ProfileImageFieldProps {
  onImageChange: (file: File | null) => void;
  imagePreview: string | null;
}
