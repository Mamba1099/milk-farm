import { z } from "zod";

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
  confirmPassword: z.string().min(1, "Please confirm your password").optional(),
  role: z.enum(["FARM_MANAGER", "EMPLOYEE"]),
  image: z
    .union([
      z.instanceof(File).refine(
        (file) => file.size <= 5 * 1024 * 1024,
        "Image must be less than 5MB"
      ).refine(
        (file) =>
          [
            "image/jpeg",
            "image/jpg",
            "image/png", 
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/tiff",
            "image/svg+xml",
          ].includes(file.type),
        "Image must be a valid image file (JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, SVG)"
      ),
      z.string().url(),
      z.string().regex(/^\/uploads\
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable(),
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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
    .refine(
      (val) => val === "" || val.length >= 8,
      "Password must be at least 8 characters long"
    )
    .refine(
      (val) => val === "" || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .optional(),
  role: z.enum(["FARM_MANAGER", "EMPLOYEE"]).optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().url(),
      z.string().regex(/^\/uploads\
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
