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
  expectedMaturityDate: z
    .string()
    .optional()
    .transform((str) => str && str.trim() !== "" ? new Date(str) : undefined),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
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
const BaseTreatmentSchema = z.object({
  animalId: z.string(),
  disease: z.string().min(1, "Disease is required"),
  medicine: z.string().optional(),
  dosage: z.string().optional(),
  treatment: z.string().min(1, "Treatment details are required"),
  cost: z.number().min(0, "Cost must be positive"),
  treatedAt: z
    .union([
      z.string().min(1).transform((str) => new Date(str)),
      z.date()
    ])
    .optional()
    .default(() => new Date()),
  treatedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateTreatmentSchema = BaseTreatmentSchema.refine(
  (data) => data.medicine || data.dosage,
  {
    message: "Either medicine or dosage must be provided",
    path: ["medicine"],
  }
);

export const UpdateTreatmentSchema = BaseTreatmentSchema.partial()
  .extend({
    id: z.string(),
  })
  .refine((data) => !data.medicine && !data.dosage ? true : data.medicine || data.dosage, {
    message: "Either medicine or dosage must be provided",
    path: ["medicine"],
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
  femaleId: z.string().min(1, "Please select a female animal"),
  servedAt: z.string().min(1, "Please select a serving date"),
  outcome: z.enum(["SUCCESSFUL", "FAILED", "PENDING"]).default("PENDING"),
  pregnancyDate: z.string().optional(),
  actualBirthDate: z.string().optional(),
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

// Production validation schema
export const productionSchema = z.object({
  animalId: z.string().min(1, "Animal ID is required"),
  date: z.string().transform((str) => new Date(str)),
  morningQuantity: z.number().min(0, "Morning quantity must be non-negative").default(0),
  eveningQuantity: z.number().min(0, "Evening quantity must be non-negative").default(0),
  calfQuantity: z.number().min(0, "Calf quantity must be non-negative").default(0),
  poshoQuantity: z.number().min(0, "Posho quantity must be non-negative").default(0),
  notes: z.string().optional(),
}).refine(
  (data) => data.morningQuantity > 0 || data.eveningQuantity > 0,
  {
    message: "At least one production quantity (morning or evening) must be greater than 0",
    path: ["quantities"],
  }
);

// Sales validation schema
export const salesSchema = z.object({
  animalId: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  quantity: z.number().positive("Quantity must be positive"),
  pricePerLiter: z.number().positive("Price per liter must be positive"),
  customerName: z.string().min(1, "Customer name is required"),
  notes: z.string().optional(),
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
