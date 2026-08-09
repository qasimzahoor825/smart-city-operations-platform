interface NotificationToast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  title?: string;
}

interface UiState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  toasts: NotificationToast[];
}

const initialState: UiState = {
  sidebarOpen: false,
  theme: "system",
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<UiState["theme"]>) => {
      state.theme = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<NotificationToast, "id">>) => {
      state.toasts.push({
        id: crypto.randomUUID(),
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const {
  toggleSidebar,
  setSidebar,
  setTheme,
  addToast,
  removeToast,
} = uiSlice.actions;

export const selectTheme = (state: { ui: UiState }): UiState["theme"] => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UiState }): boolean => state.ui.sidebarOpen;

export const uiReducer = uiSlice.reducer;