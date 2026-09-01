import {
  Droplets,
  Zap,
  HeartPulse,
  GraduationCap,
  Bus,
  Wrench,
  Building2,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import type { Department } from "@/types";

export type DepartmentSlug =
  | "public-works"
  | "water-sanitation"
  | "electricity"
  | "health"
  | "education"
  | "transport"
  | "municipal"
  | "emergency";

export interface DepartmentMeta {
  slug: DepartmentSlug;
  icon: LucideIcon;
  iconClass: string;
  ringClass: string;
  services: string[];
  contact: { phone: string; email: string; hours: string };
}

export const DEFAULT_SLUG: DepartmentSlug = "public-works";

export const DEPARTMENT_META: Record<DepartmentSlug, DepartmentMeta> = {
  "public-works": {
    slug: "public-works",
    icon: Wrench,
    iconClass: "text-sky-600",
    ringClass: "bg-sky-50 text-sky-600 border-sky-100",
    services: ["Road & pothole repairs", "Street lighting maintenance", "Footpath & signage upkeep"],
    contact: { phone: "0800-12345", email: "publicworks@smartcity.gov", hours: "Mon-Sat, 8am-5pm" },
  },
  "water-sanitation": {
    slug: "water-sanitation",
    icon: Droplets,
    iconClass: "text-teal-600",
    ringClass: "bg-teal-50 text-teal-600 border-teal-100",
    services: ["Water supply & connections", "Leakage & pipe burst response", "Drainage & sewerage"],
    contact: { phone: "0800-23456", email: "water@smartcity.gov", hours: "24/7 hotline" },
  },
  electricity: {
    slug: "electricity",
    icon: Zap,
    iconClass: "text-amber-600",
    ringClass: "bg-amber-50 text-amber-600 border-amber-100",
    services: ["Power supply & connections", "Street light outages", "Transformer & grid faults"],
    contact: { phone: "0800-34567", email: "electricity@smartcity.gov", hours: "24/7 hotline" },
  },
  health: {
    slug: "health",
    icon: HeartPulse,
    iconClass: "text-rose-600",
    ringClass: "bg-rose-50 text-rose-600 border-rose-100",
    services: ["Public health programs", "Hospitals & clinics", "Sanitation enforcement"],
    contact: { phone: "0800-45678", email: "health@smartcity.gov", hours: "Mon-Sat, 8am-6pm" },
  },
  education: {
    slug: "education",
    icon: GraduationCap,
    iconClass: "text-indigo-600",
    ringClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
    services: ["School admissions", "Education infrastructure", "Scholarship programs"],
    contact: { phone: "0800-56789", email: "education@smartcity.gov", hours: "Mon-Fri, 9am-5pm" },
  },
  transport: {
    slug: "transport",
    icon: Bus,
    iconClass: "text-cyan-600",
    ringClass: "bg-cyan-50 text-cyan-600 border-cyan-100",
    services: ["Public bus network", "Traffic signals & zones", "Transit cards"],
    contact: { phone: "0800-67890", email: "transport@smartcity.gov", hours: "Mon-Sat, 8am-6pm" },
  },
  municipal: {
    slug: "municipal",
    icon: Building2,
    iconClass: "text-violet-600",
    ringClass: "bg-violet-50 text-violet-600 border-violet-100",
    services: ["Waste collection", "Parks & public spaces", "Building permits"],
    contact: { phone: "0800-78901", email: "municipal@smartcity.gov", hours: "Mon-Sat, 8am-5pm" },
  },
  emergency: {
    slug: "emergency",
    icon: ShieldAlert,
    iconClass: "text-red-600",
    ringClass: "bg-red-50 text-red-600 border-red-100",
    services: ["Fire & rescue response", "Medical emergencies", "Civil protection"],
    contact: { phone: "1122", email: "emergency@smartcity.gov", hours: "24/7 emergency" },
  },
};

export function departmentSlug(d: Pick<Department, "id" | "code" | "name">): DepartmentSlug {
  const haystack = `${d.id} ${d.code} ${d.name}`.toLowerCase();
  if (haystack.includes("water")) return "water-sanitation";
  if (haystack.includes("electric")) return "electricity";
  if (haystack.includes("health")) return "health";
  if (haystack.includes("educat")) return "education";
  if (haystack.includes("transport")) return "transport";
  if (haystack.includes("emergency") || haystack.includes("fire")) return "emergency";
  if (haystack.includes("municipal")) return "municipal";
  return "public-works";
}

export function isDepartmentSlug(value: string): value is DepartmentSlug {
  return value in DEPARTMENT_META;
}

export function departmentMeta(slug: string): DepartmentMeta {
  return isDepartmentSlug(slug) ? DEPARTMENT_META[slug] : DEPARTMENT_META[DEFAULT_SLUG];
}