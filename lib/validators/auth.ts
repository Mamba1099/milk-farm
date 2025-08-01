import { z } from "zod";

export const UserRole = z.enum(["FARM_MANAGER", "EMPLOYEE"]);

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .refine((val) => !val.includes(" "), "Username cannot contain spaces"),

    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required")
      .max(100, "Email must be less than 100 characters"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    role: UserRole,

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
        z.string().min(1),
        z.null(),
        z.undefined()
      ])
      .optional()
      .transform((val) => {
        if (val === "" || val === undefined) return null;
        return val;
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),

  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .optional(),

  role: UserRole.optional(),

  image: z
    .instanceof(File, { message: "Please provide a valid image file" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image must be less than 5MB"
    )
    .refine(
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
    )
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserRoleType = z.infer<typeof UserRole>;
