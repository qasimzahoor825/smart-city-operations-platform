import { AUTH_REFRESH_KEY, AUTH_TOKEN_KEY } from "@/config/env";

const SESSION_COOKIE = "smartcity_session";

function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Expires=${expires}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Thin wrapper over localStorage for access/refresh token management,
 * mirroring the presence of a session to a cookie so Next.js middleware
 * (edge runtime) can perform route protection. Browser-only.
 */
export const tokenStore = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(AUTH_REFRESH_KEY);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    window.localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
    setCookie(SESSION_COOKIE, accessToken);
  },

  setAccessToken(accessToken: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    setCookie(SESSION_COOKIE, accessToken);
  },

  hasSessionCookie(): boolean {
    if (typeof document === "undefined") return false;
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${SESSION_COOKIE}=`));
  },

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_REFRESH_KEY);
    clearCookie(SESSION_COOKIE);
  },
};

export { SESSION_COOKIE };