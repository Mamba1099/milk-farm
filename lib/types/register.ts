export interface RegisterFormInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "EMPLOYEE" | "FARM_MANAGER";
  image?: File | null;
}
