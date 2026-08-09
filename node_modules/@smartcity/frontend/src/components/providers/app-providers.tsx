"use client";

import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { store } from "@/store";
import { queryClient } from "@/lib/query";
import { AuthBootstrap } from "@/components/providers/auth-bootstrap";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            className: "!bg-slate-900 !border !border-slate-800 !text-slate-100",
          }}
        />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}