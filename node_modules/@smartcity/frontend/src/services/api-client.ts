import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL, API_TIMEOUT, AUTH_REFRESH_KEY, AUTH_TOKEN_KEY } from "@/config/env";
import type { ApiErrorPayload, ApiResponse } from "@/types";
import { tokenStore } from "@/services/token-storage";

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown): void {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  failedQueue = [];
}

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => instance(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = window.localStorage.getItem(AUTH_REFRESH_KEY);
        if (!refresh) throw new Error("No refresh token available");
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refresh,
        });
        const result = (
          data as ApiResponse<{ accessToken: string; refreshToken: string }>
        ).data;
        if (!result?.accessToken) throw new Error("Refresh response missing tokens");
        const { accessToken, refreshToken } = result;
        window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        window.localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
        processQueue(null);
        return instance(original);
      } catch (refreshError) {
        processQueue(refreshError);
        tokenStore.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;