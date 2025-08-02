import { z } from "zod";

export const CreateSalesSchema = z.object({
  animalId: z.string().optional(),
  date: z.string().datetime("Invalid date format"),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  pricePerLiter: z.number().min(0.1, "Price per liter must be greater than 0"),
  customerName: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateSalesInput = z.infer<typeof CreateSalesSchema>;