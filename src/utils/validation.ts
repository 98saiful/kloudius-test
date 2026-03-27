import { z } from "zod";

const emailSchema = z.email().trim().min(1, "Email is required.");
// .email('Please enter a valid email address.');

const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(6, "Password must be at least 6 characters.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
