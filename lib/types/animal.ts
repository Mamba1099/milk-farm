// Animal related types and interfaces

// Base Animal type matching Prisma model
export interface Animal {
  id: string;
  tagNumber: string;
  name?: string | null;
  type: "COW" | "BULL" | "CALF";
  gender: "MALE" | "FEMALE";
  birthDate: string | Date;
  expectedMaturityDate?: string | Date | null;
  motherName?: string | null;
  fatherName?: string | null;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINED";
  weight?: number | null;
  image?: string | null;
  notes?: string | null;
  isMatured: boolean;
  isReadyForProduction: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Extended Animal type with populated relations
export interface AnimalWithRelations extends Animal {
  treatments?: Treatment[];
  productionRecords?: Production[];
  disposals?: Disposal[];
  servings?: Serving[];
  salesRecords?: Sales[];
}

// For backward compatibility with existing components that expect nested parent objects
export interface AnimalWithParents extends Omit<AnimalWithRelations, 'motherName' | 'fatherName'> {
  mother?: { id: string; tagNumber: string; name?: string | null } | null;
  father?: { id: string; tagNumber: string; name?: string | null } | null;
}

// Treatment type
export interface Treatment {
  id: string;
  animalId: string;
  disease: string;
  medicine: string;
  dosage: string;
  treatment: string;
  cost: number;
  treatedById: string;
  treatedAt: string | Date;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Production type
export interface Production {
  id: string;
  animalId: string;
  date: string | Date;
  morningQuantity: number;
  eveningQuantity: number;
  totalQuantity: number;
  calfQuantity: number;
  poshoQuantity: number;
  availableForSales: number;
  carryOverQuantity: number;
  recordedById: string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Disposal type
export interface Disposal {
  id: string;
  animalId: string;
  reason: "SOLD" | "DIED" | "SLAUGHTERED" | "DONATED" | "OTHER";
  amount?: number | null;
  disposedAt: string | Date;
  disposedById: string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Serving type
export interface Serving {
  id: string;
  femaleId: string;
  maleId?: string | null;
  servedAt: string | Date;
  outcome: "SUCCESSFUL" | "FAILED" | "PENDING";
  pregnancyDate?: string | Date | null;
  actualBirthDate?: string | Date | null;
  servedById: string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Sales type
export interface Sales {
  id: string;
  animalId?: string | null;
  date: string | Date;
  timeRecorded: string | Date;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  soldById: string;
  customerName?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  animal: AnimalWithParents; // Use type that supports nested parent objects for UI components
  onView: (animal: AnimalWithParents) => void;
  onEdit?: (animal: AnimalWithParents) => void;
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

export interface AnimalEditDialogProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
}

export interface AnimalDetailsDialogProps {
  animal: AnimalWithParents; // Use type that supports nested parent objects for UI
  isOpen: boolean;
  onClose: () => void;
}

export interface AnimalEditFormInput {
  tagNumber: string;
  name: string;
  type: "COW" | "BULL" | "CALF";
  gender: "MALE" | "FEMALE";
  birthDate: string;
  expectedMaturityDate?: string;
  weight?: string;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINED";
  motherName?: string;
  fatherName?: string;
}
