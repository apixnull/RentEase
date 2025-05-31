import { z } from "zod";

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name can't be longer than 50 characters")
      .trim(),

    email: z
      .string()
      .email("Invalid email address")
      .max(100, "Email too long")
      .trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password can't be longer than 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

    confirmPassword: z.string({message: "Confirm Password Required"}),

    role: z.enum(["TENANT", "LANDLORD"], {
      required_error: "Account type is required",
      invalid_type_error: "Invalid account type",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // error points to confirmPassword field
  });
