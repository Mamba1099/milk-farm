export interface Sale {
  id: string;
  timeRecorded: string;
  quantity: number;
  totalAmount: number;
  customerName?: string;
  payment_method: "CASH" | "MPESA";
  soldById: string;
  createdAt: string;
  updatedAt: string;
  soldBy?: {
    id: string;
    username: string;
  };
}

export interface SalesStats {
  totalProduction: number;
  totalSales: number;
  balanceRemaining: number;
  revenue: number;
}

export interface CreateSaleData {
  customerName?: string;
  quantity: number;
  totalAmount: number;
  payment_method: "CASH" | "MPESA";
}
