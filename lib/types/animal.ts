// Animal related types and interfaces
export interface Animal {
  id: string;
  tagNumber: string;
  name?: string | null;
  type: "COW" | "BULL" | "CALF";
  gender: "MALE" | "FEMALE";
  birthDate: string;
  expectedMaturityDate?: string | null;
  weight?: number | null;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINED";
  image?: string | null;
  motherId?: string | null;
  fatherId?: string | null;
  mother?: { id: string; tagNumber: string; name?: string | null } | null;
  father?: { id: string; tagNumber: string; name?: string | null } | null;
  isMatured?: boolean;
  isReadyForProduction?: boolean;
  notes?: string | null;
  treatments?: unknown[];
  productionRecords?: unknown[];
}

export interface AnimalWithDetails extends Animal {
  isMatured: boolean;
  isReadyForProduction: boolean;
}

export interface AnimalFilters {
  searchTerm: string;
  selectedType: string;
  selectedGender: string;
  selectedHealth: string;
}

export interface AnimalCardProps {
  animal: Animal;
  onView: (animal: Animal) => void;
  onEdit?: (animal: Animal) => void;
  onDelete?: (animalId: string) => void;
  canEdit?: boolean;
}

export interface AnimalFiltersProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
}

export interface AnimalAddFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}
