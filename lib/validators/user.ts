import { z } from "zod";

// User/Employee validation schemas
export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: z.enum(["FARM_MANAGER", "EMPLOYEE"]),
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
});

export const UpdateUserSchema = z.object({
  id: z.string(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .optional(),
  role: z.enum(["FARM_MANAGER", "EMPLOYEE"]).optional(),
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
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
