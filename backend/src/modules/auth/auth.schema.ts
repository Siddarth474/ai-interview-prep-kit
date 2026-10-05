import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(30, { message: "Username cannot exceed 30 characters" })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message:
        "Username can only contain letters, numbers, underscores, dots, and hyphens",
    })
    .transform((val) => val.toLowerCase()),
  email: z
    .string()
    .trim()
    .email({ message: "Please provide a valid email address" })
    .max(255, { message: "Email cannot exceed 255 characters" })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(128, { message: "Password cannot exceed 128 characters" })
    // .regex(/[A-Z]/, {
    //   message: "Password must contain at least one uppercase letter",
    // })
    // .regex(/[a-z]/, {
    //   message: "Password must contain at least one lowercase letter",
    // })
    // .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

export const loginSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1, { message: "Email or username is required" })
      .optional(),
    email: z
      .string()
      .trim()
      .email({ message: "Please provide a valid email address" })
      .optional(),
    username: z
      .string()
      .trim()
      .min(1, { message: "Username cannot be empty" })
      .optional(),
    password: z.string().min(1, { message: "Password is required" }),
  })
  .refine((data) => Boolean(data.email || data.username || data.identifier), {
    message: "Either email, username, or identifier is required",
    path: ["identifier"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
