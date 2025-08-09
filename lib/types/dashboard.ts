export interface Animal {
  id: string;
  tagNumber: string;
  name?: string;
  type: "COW" | "BULL" | "CALF";
  gender: "MALE" | "FEMALE";
  healthStatus: "HEALTHY" | "SICK" | "INJURED";
  isMatured: boolean;
  birthDate: string;
  image?: string;
  createdAt: string;
}

export interface Production {
  id: string;
  date: string;
  totalQuantity: number;
  morningQuantity: number;
  eveningQuantity: number;
  calfQuantity: number;
  poshoQuantity: number;
  availableForSales: number;
  carryOverQuantity: number;
  animalId: string;
  recordedById: string;
  notes?: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  animalId: string;
  disease: string;
  medicine: string;
  dosage: string;
  treatment: string;
  cost: number;
  treatedAt: string;
  notes?: string;
  createdAt: string;
}

export interface UserStats {
  active: number;
  total: number;
  totalUsers: number;
  activeUsers: number;
  farmManagers: number;
  employees: number;
}

export interface SystemHealth {
  environment: string;
  database: {
    status: string;
    error?: string | null;
  };
  fileStorage: {
    status: string;
  };
  authSystem: {
    status: string;
  };
  api: {
    status: string;
  };
  lastBackup: string | null;
  timestamp: string;
}

export interface DashboardStats {
  animals: {
    total: number;
    cows: number;
    bulls: number;
    calves: number;
    healthy: number;
    sick: number;
    injured: number;
    matured: number;
  };
  production: {
    totalRecords: number;
    todayQuantity: number;
    weeklyTotal: number;
    weeklyAverage: number;
    monthlyTotal: number;
    totalQuantity: number;
    averageDaily: number;
    averagePerAnimal: number;
    lastRecordDate: string | null;
  };
  treatments: {
    totalRecords: number;
    thisMonth: number;
    pendingFollowups: number;
    lastTreatmentDate: string | null;
    totalCost: number;
  };
  users: UserStats;
  systemHealth: SystemHealth;
}
