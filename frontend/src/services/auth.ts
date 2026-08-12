import api from "@/services/api-client";
import type { ApiResponse, AuthSession, AuthUser, Role } from "@/types";

export interface PermissionClaim {
  resource: string;
  action: "create" | "read" | "update" | "delete" | "assign" | "manage";
  scope: string;
}

export interface RoleInfo {
  role: string;
  name: string;
  description: string;
  permissions: string[];
  claims: PermissionClaim[];
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: Role;
}

export interface RegisterResult {
  user: AuthUser;
  requiresOtp: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await api.post<ApiResponse<AuthSession>>("/auth/login", payload);
    return data.data as AuthSession;
  },

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const { data } = await api.post<ApiResponse<RegisterResult>>("/auth/register", payload);
    return data.data as RegisterResult;
  },

  async verifyOtp(email: string, otp: string): Promise<AuthSession> {
    const { data } = await api.post<ApiResponse<AuthSession>>("/auth/verify-email", { email, otp });
    return data.data as AuthSession;
  },

  async resendOtp(email: string): Promise<{ message: string }> {
    const { data } = await api.post<ApiResponse<{ message: string }>>("/auth/resend-otp", { email });
    return data.data as { message: string };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data } = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/auth/refresh",
      { refreshToken },
    );
    return data.data as { accessToken: string; refreshToken: string };
  },

  async logout(sessionId?: string, refreshToken?: string): Promise<void> {
    await api.post("/auth/logout", { sessionId, refreshToken });
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<ApiResponse<AuthUser>>("/auth/me");
    return data.data as AuthUser;
  },

  async updateProfile(payload: Partial<{ fullName: string; phoneNumber: string; email: string; avatar: string }>): Promise<AuthUser> {
    const { data } = await api.patch<ApiResponse<AuthUser>>("/auth/me", payload);
    return data.data as AuthUser;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const { data } = await api.post<ApiResponse<{ message: string; resetToken?: string }>>(
      "/auth/forgot-password",
      { email },
    );
    return data.data as { message: string; resetToken?: string };
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/reset-password", { token, password });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post("/auth/change-password", { currentPassword, newPassword });
  },

  async listSessions(): Promise<unknown[]> {
    const { data } = await api.get<ApiResponse<unknown[]>>("/auth/sessions");
    return data.data ?? [];
  },

  async getRoles(): Promise<string[]> {
    const { data } = await api.get<ApiResponse<RoleInfo[]>>("/roles");
    return (data.data ?? []).map((r) => r.role);
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },
};

export type AuthAuth = typeof authApi;