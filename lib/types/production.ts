export interface ProductionStats {
  todayProduction: number;
  weekProduction: number;
  monthProduction: number;
  activeAnimals: number;
  morningTotal: number;
  eveningTotal: number;
}

export interface ProductionRecordsListProps {
  records: ProductionRecord[];
  stats: ProductionStats;
  userRole?: string;
  showStats?: boolean;
  showAddButton?: boolean;
  title?: string;
  className?: string;
  viewTab?: "production" | "calves";
  setViewTab?: (tab: "production" | "calves") => void;
  calvesCount?: number;
}

export interface ProductionRecordsTableProps {
  records: ProductionRecord[];
  userRole?: string;
  viewTab?: "production" | "calves";
}


export interface ProductionAnimal {
  image_url: any;
  id: string;
  tagNumber: string;
  name?: string;
  type: "COW" | "BULL" | "CALF";
  image?: string;
  motherName?: string;
  motherOf: Array<{
    id: string;
    tagNumber: string;
    name?: string;
    birthDate: string;
  }>;
}

export interface ProductionRecord {
  id: string;
  animalId: string;
  date: string;
  quantity_am?: number;
  quantity_pm?: number;
  calf_quantity_fed_am?: number;
  calf_quantity_fed_pm?: number;
  balance_am?: number;
  balance_pm?: number;
  createdAt?: string;
  updatedAt?: string;
  animal: ProductionAnimal;
  recordedBy: {
    id: string;
    username: string;
  };
}

export interface SalesRecord {
  id: string;
  date: string;
  timeRecorded: string;
  quantity: number;
  totalAmount: number;
  customerName?: string;
  payment_method: "CASH" | "MPESA";
  notes?: string;
  soldBy: {
    id: string;
    username: string;
  };
}

export interface CreateProductionData {
  animalId: string;
  date: string;
  type: "morning" | "evening" | "summary";
  quantity_am?: number;
  quantity_pm?: number;
  calf_quantity_fed_am?: number;
  calf_quantity_fed_pm?: number;
  posho_deduction_am?: number;
  posho_deduction_pm?: number;
}

export interface CreateSalesData {
  date: string;
  quantity: number;
  pricePerLiter: number;
  customerName?: string;
  payment_method: "CASH" | "MPESA";
  notes?: string;
}
