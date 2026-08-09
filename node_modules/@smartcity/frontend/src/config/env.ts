export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SmartCity Ops";
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100/api/v1";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4100";
export const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000);

export const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? "smartcity_access_token";
export const AUTH_REFRESH_KEY = process.env.NEXT_PUBLIC_AUTH_REFRESH_KEY ?? "smartcity_refresh_token";

export const ENABLE_MAPBOX = process.env.NEXT_PUBLIC_ENABLE_MAPBOX === "true";
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAP_TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const MAP_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const MAP_TILE_KEY = process.env.NEXT_PUBLIC_MAP_TILE_KEY ?? "";