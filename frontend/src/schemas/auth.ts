import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phoneNumber: z
      .string()
      .min(7, "Phone number is required for SMS OTP")
      .regex(/^\+?[\d\s\-()]{7,15}$/, "Enter a valid phone number"),
    role: z.enum(["CITIZEN", "OFFICER", "DEPARTMENT_HEAD", "SUPER_ADMIN"]).default("CITIZEN"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/\d/, "Password must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, "Enter the verification code")
    .regex(/^\d{4,8}$/, "Code must be 4-8 digits"),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;