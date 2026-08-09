"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectAuthLoading,
  selectHasRole,
  selectIsAuthenticated,
  selectIsInitialized,
  selectUser,
  logout as logoutAction,
} from "@/store/slices/auth-slice";
import { tokenStore } from "@/services/token-storage";
import { authApi } from "@/services/auth";
import { roleHome } from "@/constants/navigation";
import type { Role } from "@/types";
import type { Route } from "next";

export function useAuth() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectAuthLoading);

  return { user, isAuthenticated, isInitialized, isLoading };
}

export function useHasRole(...roles: Role[]) {
  return useAppSelector(selectHasRole(...roles));
}

/** Redirects unauthenticated users to /login. Render children only when allowed. */
export function useRequireAuth() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);
  return { allowed: isInitialized && isAuthenticated };
}

export function useRequireRole(...roles: Role[]) {
  const router = useRouter();
  const hasRole = useHasRole(...roles);
  const { isInitialized } = useAuth();
  useEffect(() => {
    if (isInitialized && !hasRole) {
      router.replace("/login");
    }
  }, [isInitialized, hasRole, router]);
  return { allowed: isInitialized && hasRole };
}

/** Signs out via the API, clears tokens and navigates to the login page. */
export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return async (): Promise<void> => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      await authApi.logout(undefined, refreshToken ?? undefined);
    } catch {
      // Ignore network errors; clear locally regardless.
    }
    tokenStore.clear();
    dispatch(logoutAction());
    router.replace("/login");
  };
}

/** Navigates to a user's role-appropriate dashboard. */
export function useGoToDashboard() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  return () => {
    toast.success(`Welcome, ${user?.fullName?.split(" ")[0] ?? "there"}`);
    router.push(roleHome(user?.role) as Route);
  };
}