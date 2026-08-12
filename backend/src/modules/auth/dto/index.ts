import { UserRole } from "@smartcity/common";

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: UserRole;
  departmentId?: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ResendOtpDto {
  email: string;
}

/** Register response — account is created but requires OTP verification. */
export interface RegisterResult {
  user: PublicUser;
  requiresOtp: boolean;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string | null;
  departmentId?: string | null;
  isEmailVerified: boolean;
}

export interface AuthSession {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}