import type { AxiosError } from "axios";

import type { ApiErrorPayload } from "@/types";

export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const payload = axiosError.response?.data;
    if (payload?.message) return payload.message;
    if (payload?.errors) {
      const firstError = Object.values(payload.errors)[0]?.[0];
      if (firstError) return firstError;
    }
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}

export function isAxiosError(error: unknown): error is AxiosError<ApiErrorPayload> {
  return axiosIsAxiosError(error);
}

import { isAxiosError as axiosIsAxiosError } from "axios";