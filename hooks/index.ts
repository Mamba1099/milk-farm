// Auth mutations
export {
  useRegisterMutation,
  type RegisterResponse,
  type RegisterError,
} from "./use-auth-mutations";

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

// Auth hooks
export {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useCurrentUser,
  type LoginInput,
  type LoginResponse,
  type User,
  type AuthError,
} from "./use-auth-hooks";

// Auth queries
export {
  useFarmManagerExists,
  useRegistrationStatus,
} from "./use-auth-queries";

// UI hooks
export { useToast, type Toast } from "./use-toast";

// Animal hooks
export * from "./use-animal-hooks";

// Employee hooks
export * from "./use-employee-hooks";

// Reports hooks
export * from "./use-reports-hooks";
