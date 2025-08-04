export * from './auth';
export * from './reports';
export * from './dashboard';
export * from './dashboard-components';
export * from './drawer';

// Animal types - explicitly exported to avoid conflicts with dashboard types
export type { 
  Animal as DetailedAnimal,
  AnimalWithRelations,
  AnimalWithParents,
  AnimalWithDetails,
  AnimalFilters,
  AnimalCardProps,
  AnimalFiltersProps,
  AnimalAddFormProps,
  AnimalEditDialogProps,
  AnimalDetailsDialogProps,
  AnimalEditFormInput,
  Treatment as DetailedTreatment,
  Production as DetailedProduction,
  Disposal,
  Serving,
  Sales
} from './animal';
