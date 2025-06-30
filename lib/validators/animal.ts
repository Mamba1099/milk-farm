import { z } from "zod";

// Enum schemas matching Prisma enums
export const GenderSchema = z.enum(["MALE", "FEMALE"]);
export const AnimalTypeSchema = z.enum(["COW", "BULL", "CALF"]);
export const HealthStatusSchema = z.enum([
  "HEALTHY",
  "SICK",
  "RECOVERING",
  "QUARANTINED",
]);
export const DisposalReasonSchema = z.enum([
  "SOLD",
  "DIED",
  "SLAUGHTERED",
  "DONATED",
  "OTHER",
]);
export const ServingOutcomeSchema = z.enum(["SUCCESSFUL", "FAILED", "PENDING"]);
export const MilkAllocationSchema = z.enum([
  "CALF",
  "POSHO",
  "SALES",
  "CARRY_OVER",
]);

// Animal validation schemas
export const CreateAnimalSchema = z.object({
  tagNumber: z.string().min(1, "Tag number is required"),
  name: z.string().optional(),
  type: AnimalTypeSchema,
  gender: GenderSchema,
  birthDate: z.string().transform((str) => new Date(str)),
  motherId: z.string().optional(),
  fatherId: z.string().optional(),
  healthStatus: HealthStatusSchema.default("HEALTHY"),
  weight: z.number().positive().optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().url(),
      z.string().regex(/^\/uploads\//, "Must be a valid file path or URL"),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable(),
  notes: z.string().optional(),
});

export const UpdateAnimalSchema = CreateAnimalSchema.partial().extend({
  id: z.string(),
});

export const AnimalQuerySchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  search: z.string().optional(),
  type: AnimalTypeSchema.optional(),
  gender: GenderSchema.optional(),
  healthStatus: HealthStatusSchema.optional(),
  isMatured: z.boolean().optional(),
});

// Treatment validation schemas
export const CreateTreatmentSchema = z.object({
  animalId: z.string(),
  disease: z.string().min(1, "Disease is required"),
  medicine: z.string().min(1, "Medicine is required"),
  dosage: z.string().min(1, "Dosage is required"),
  treatment: z.string().min(1, "Treatment details are required"),
  cost: z.number().min(0, "Cost must be positive"),
  treatedAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  notes: z.string().optional(),
});

export const UpdateTreatmentSchema = CreateTreatmentSchema.partial().extend({
  id: z.string(),
});

// Disposal validation schemas
export const CreateDisposalSchema = z.object({
  animalId: z.string(),
  reason: DisposalReasonSchema,
  amount: z.number().min(0).optional(),
  disposedAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  notes: z.string().optional(),
});

export const UpdateDisposalSchema = CreateDisposalSchema.partial().extend({
  id: z.string(),
});

// Serving validation schemas
export const CreateServingSchema = z.object({
  femaleId: z.string(),
  maleId: z.string().optional(),
  servedAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  outcome: ServingOutcomeSchema.default("PENDING"),
  pregnancyDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  actualBirthDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  notes: z.string().optional(),
});

export const UpdateServingSchema = CreateServingSchema.partial().extend({
  id: z.string(),
});

// Production validation schemas
const BaseProductionSchema = z.object({
  animalId: z.string(),
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  morning: z.number().min(0).default(0),
  evening: z.number().min(0).default(0),
  allocation: MilkAllocationSchema,
  notes: z.string().optional(),
});

export const CreateProductionSchema = BaseProductionSchema.refine(
  (data) => {
    // Calculate total milk
    return data.morning + data.evening > 0;
  },
  {
    message: "Total milk production must be greater than 0",
  }
);

export const UpdateProductionSchema = BaseProductionSchema.partial().extend({
  id: z.string(),
});

// Type exports for frontend use
export type CreateAnimalInput = z.infer<typeof CreateAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof UpdateAnimalSchema>;
export type AnimalQuery = z.infer<typeof AnimalQuerySchema>;
export type CreateTreatmentInput = z.infer<typeof CreateTreatmentSchema>;
export type UpdateTreatmentInput = z.infer<typeof UpdateTreatmentSchema>;
export type CreateDisposalInput = z.infer<typeof CreateDisposalSchema>;
export type UpdateDisposalInput = z.infer<typeof UpdateDisposalSchema>;
export type CreateServingInput = z.infer<typeof CreateServingSchema>;
export type UpdateServingInput = z.infer<typeof UpdateServingSchema>;
export type CreateProductionInput = z.infer<typeof CreateProductionSchema>;
export type UpdateProductionInput = z.infer<typeof UpdateProductionSchema>;
