export const APP_NAME = "SmartCity OS";
export const API_VERSION = "v1";

export const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Citizen",
  OFFICER: "Municipal Officer",
  DEPARTMENT_HEAD: "Department Head",
  SUPER_ADMIN: "Super Admin",
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const COMPLAINT_CATEGORIES = [
  "ROAD",
  "WATER",
  "ELECTRICITY",
  "STREET_LIGHT",
  "GARBAGE",
  "PARKS",
  "NOISE",
  "OTHER",
] as const;

export const SLA_HOURS_BY_STATUS: Record<string, number> = {
  SUBMITTED: 72,
  ASSIGNED: 48,
  IN_PROGRESS: 24,
};
