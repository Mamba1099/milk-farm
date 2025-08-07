export { useRegisterMutation } from "./use-register";
export { useLoginMutation } from "./use-login";
export { useSessionCheck } from "./use-session-check";
export {
  useCurrentUser,
  useFarmManagerExists,
  useLogoutMutation,
} from "./use-user-queries";

export {
  useDashboardStats,
  useAnimalStats,
  useProductionStats,
  useTreatmentStats,
  useUserStats,
  useSystemHealth,
} from "./use-dashboard-hooks";

export { useToast, type Toast } from "./use-toast";
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
export * from "./use-reports-hooks";
