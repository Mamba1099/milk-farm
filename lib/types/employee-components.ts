import { Employee } from './employee';

export interface EmployeeEditFormProps {
  user: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface UserStatisticsProps {
  stats?: {
    totalUsers: number;
    farmManagers: number;
    employees: number;
  };
  isLoading: boolean;
  error?: Error | null;
}
