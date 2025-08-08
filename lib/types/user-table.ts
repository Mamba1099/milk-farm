import { Employee } from './employee';

export interface UserTableProps {
  users: Employee[];
  filteredUsers: Employee[];
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  error?: Error | null;
  canEdit: boolean;
  currentUser?: Employee | null;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
}

export interface UserTableViewProps {
  filteredUsers: Employee[];
  canEdit: boolean;
  currentUser?: Employee | null;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  canEditEmployee: (employee: Employee) => boolean;
  canDeleteEmployee: (employee: Employee) => boolean;
}
