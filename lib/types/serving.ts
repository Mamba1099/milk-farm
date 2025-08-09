export interface ServingRecord {
  id: string;
  femaleId: string;
  bullName?: string;
  servingType: 'BULL' | 'AI';
  ovaType: 'PREDETERMINED' | 'NORMAL';
  dateServed: string;
  servedBy: string;
  outcome: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  actualBirthDate?: string;
  recordedById: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  female: {
    id: string;
    name?: string;
    tagNumber: string;
    type: string;
  };
  recordedBy: {
    id: string;
    username: string;
  };
}

export interface ServingResponse {
  servings: ServingRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateServingData {
  femaleId: string;
  bullName?: string;
  servingType: 'BULL' | 'AI';
  ovaType: 'PREDETERMINED' | 'NORMAL';
  dateServed: string;
  servedBy: string;
  notes?: string;
}

export interface UpdateServingData {
  id: string;
  outcome: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  actualBirthDate?: string;
  notes?: string;
}

export interface ServingFilters {
  animalId?: string;
  servingType?: 'BULL' | 'AI';
  outcome?: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  ovaType?: 'PREDETERMINED' | 'NORMAL';
  search?: string;
}

export interface ServingStats {
  total: number;
  pending: number;
  successful: number;
  failed: number;
  predetermined: number;
  normalOva: number;
}

export interface ServingRecordsListProps {
  filters?: ServingFilters;
  showAddButton?: boolean;
  showStats?: boolean;
  title?: string;
  className?: string;
}

export interface CountdownTimerProps {
  targetDate: string | Date;
  showIcon?: boolean;
  className?: string;
}

export interface ServingEditDialogProps {
  serving: ServingRecord | null;
  onClose: () => void;
  open: boolean;
}

export interface ServingRecordsTableProps {
  servings: ServingRecord[];
  showAddButton?: boolean;
  title?: string;
  onEdit?: (serving: ServingRecord) => void;
}