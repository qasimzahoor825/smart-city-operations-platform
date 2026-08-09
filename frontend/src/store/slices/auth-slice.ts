import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { tokenStore } from "@/services/token-storage";
import type { AuthUser, Role } from "@/types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const accessToken = typeof window !== "undefined" ? tokenStore.getAccessToken() : null;

const initialState: AuthState = {
  user: null,
  accessToken,
  isAuthenticated: Boolean(accessToken),
  isLoading: true,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isLoading = false;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isLoading = false;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.isLoading = false;
    },
  },
});

export const { setCredentials, setUser, setInitialized, logout } = authSlice.actions;

export const selectUser = (state: { auth: AuthState }): AuthUser | null => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }): boolean => state.auth.isInitialized;
export const selectAuthLoading = (state: { auth: AuthState }): boolean => state.auth.isLoading;
export const selectAccessToken = (state: { auth: AuthState }): string | null =>
  state.auth.accessToken;

export const selectHasRole =
  (...roles: Role[]) =>
  (state: { auth: AuthState }): boolean =>
    Boolean(state.auth.user && roles.includes(state.auth.user.role));

export const authReducer = authSlice.reducer;