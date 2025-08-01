// Auth mutations
export { useRegisterMutation } from "./use-register";
export { useLoginMutation } from "./use-login";

// User queries and auth mutations
export {
  useCurrentUser,
  useFarmManagerExists,
  useLogoutMutation,
} from "./use-user-queries";

// Dashboard hooks
export {
  useDashboardStats,
  useAnimalStats,
  useProductionStats,
  useTreatmentStats,
  useUserStats,
  useSystemHealth,
  type Animal,
  type Production,
  type Treatment,
  type UserStats,
  type SystemHealth,
  type DashboardStats,
} from "./use-dashboard-hooks";

// UI hooks
export { useToast, type Toast } from "./use-toast";

// Animal hooks
export * from "./use-animal-hooks";

// Employee hooks
export * from "./use-employee-hooks";

// Reports hooks
export * from "./use-reports-hooks";
