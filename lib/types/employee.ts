export interface Employee {
  id: string;
  username: string;
  email: string;
  role: "FARM_MANAGER" | "EMPLOYEE";
  image?: string | null;
  image_url?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "FARM_MANAGER" | "EMPLOYEE";
  image?: File | string | null;
}

export interface UpdateEmployeeInput {
  username?: string;
  email?: string;
  role?: "FARM_MANAGER" | "EMPLOYEE";
  password?: string;
  image?: File;
}

export interface EmployeesResponse {
  users: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
