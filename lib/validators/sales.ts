import { z } from "zod";

export const CreateSalesSchema = z.object({
  date: z.string().datetime("Invalid date format"),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  customerName: z.string().optional(),
  notes: z.string().optional(),
  payment_method: z.enum(["CASH", "MPESA"], { required_error: "Payment method is required" }),
});

export type CreateSalesInput = z.infer<typeof CreateSalesSchema>;