export { useRegisterMutation } from "./use-register";
export { useLoginMutation } from "./use-login";
export {
  useCurrentUser,
  useFarmManagerExists,
  useLogoutMutation,
} from "./use-user-queries";

export {
  useDashboardStats,
  useAnimalStats,
  useProductionStats,
  useUserStats,
  useSystemHealth,
} from "./use-dashboard-hooks";


export {
  useSales,
  useSalesStats,
  useCreateSale,
} from "./use-sales-hooks";
export {
  useAnimals,
  useAnimal,
  useCreateAnimal,
  useUpdateAnimal,
  useDeleteAnimal,
  useTreatments,
  useCreateTreatment,
  useProduction,
  useCreateProduction,
  useAvailableParents,
  useAvailableProductionAnimals,
  useTreatmentDiseases,
  useTreatmentStatistics,
} from "./use-animal-hooks";
export * from "./use-employee-hooks";
