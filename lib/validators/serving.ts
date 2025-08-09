import { z } from "zod";

export const createServingSchema = z.object({
  femaleId: z.string().min(1, 'Female animal is required'),
  bullName: z.string().optional(),
  servingType: z.enum(['BULL', 'AI'], {
    required_error: 'Serving type is required',
  }),
  ovaType: z.enum(['PREDETERMINED', 'NORMAL']).default('NORMAL'),
  dateServed: z.string().min(1, 'Serving date is required'),
  servedBy: z.string().min(1, 'Served by is required'),
  notes: z.string().optional(),
});

export const updateServingSchema = z.object({
  id: z.string().min(1, "Serving ID is required"),
  outcome: z.enum(["SUCCESSFUL", "FAILED", "PENDING"]),
  actualBirthDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateServingInput = z.infer<typeof createServingSchema>;
export type UpdateServingInput = z.infer<typeof updateServingSchema>;
