import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

/**
 * Central, role-aware navigation registry used by the dynamic sidebar and
 * route guards. The `icon` string maps to a Lucide icon name in NavLink.
 */
export const NAVIGATION: NavItem[] = [
  // Citizens
  { label: "Dashboard", href: "/citizen/dashboard", icon: "LayoutDashboard", roles: ["CITIZEN"] },
  { label: "My Complaints", href: "/citizen/complaints", icon: "ClipboardList", roles: ["CITIZEN"] },
  { label: "Appointments", href: "/citizen/appointments", icon: "CalendarClock", roles: ["CITIZEN"] },
  { label: "Payments", href: "/citizen/payments", icon: "CreditCard", roles: ["CITIZEN"] },
  { label: "Notifications", href: "/citizen/notifications", icon: "Bell", roles: ["CITIZEN"] },
  { label: "Profile", href: "/citizen/profile", icon: "User", roles: ["CITIZEN"] },
  { label: "Settings", href: "/citizen/settings", icon: "Settings", roles: ["CITIZEN"] },

  // Officers & Department Heads
  { label: "Dashboard", href: "/department/dashboard", icon: "LayoutDashboard", roles: ["OFFICER", "DEPARTMENT_HEAD"] },
  { label: "Complaints", href: "/department/complaints", icon: "ClipboardList", roles: ["OFFICER", "DEPARTMENT_HEAD"] },
  { label: "GIS Map", href: "/department/gis", icon: "Map", roles: ["OFFICER", "DEPARTMENT_HEAD"] },
  { label: "Emergency", href: "/department/emergency", icon: "Siren", roles: ["OFFICER", "DEPARTMENT_HEAD"] },
  { label: "Analytics", href: "/department/analytics", icon: "BarChart3", roles: ["DEPARTMENT_HEAD"] },
  { label: "Reports", href: "/department/reports", icon: "FileText", roles: ["DEPARTMENT_HEAD"] },
  { label: "Assets", href: "/department/assets", icon: "HardHat", roles: ["OFFICER", "DEPARTMENT_HEAD"] },
  { label: "Notifications", href: "/department/notifications", icon: "Bell", roles: ["OFFICER", "DEPARTMENT_HEAD"] },

  // Super Admin
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard", roles: ["SUPER_ADMIN"] },
  { label: "Users", href: "/admin/users", icon: "Users", roles: ["SUPER_ADMIN"] },
  { label: "Departments", href: "/admin/departments", icon: "Building2", roles: ["SUPER_ADMIN"] },
  { label: "Roles & Permissions", href: "/admin/roles", icon: "ShieldCheck", roles: ["SUPER_ADMIN"] },
  { label: "Complaints", href: "/admin/complaints", icon: "ClipboardList", roles: ["SUPER_ADMIN"] },
  { label: "Assets", href: "/admin/assets", icon: "HardHat", roles: ["SUPER_ADMIN"] },
  { label: "Emergency", href: "/admin/emergency", icon: "Siren", roles: ["SUPER_ADMIN"] },
  { label: "Reports", href: "/admin/reports", icon: "FileText", roles: ["SUPER_ADMIN"] },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3", roles: ["SUPER_ADMIN"] },
  { label: "Settings", href: "/admin/settings", icon: "Settings", roles: ["SUPER_ADMIN"] },
];

export function navigationFor(role: Role | null | undefined): NavItem[] {
  if (!role) return [];
  return NAVIGATION.filter((item) => item.roles.includes(role));
}

export function roleHome(role: Role | null | undefined): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "OFFICER":
    case "DEPARTMENT_HEAD":
      return "/department/dashboard";
    case "CITIZEN":
    default:
      return "/citizen/dashboard";
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  CITIZEN: "Citizen",
  OFFICER: "Municipal Officer",
  DEPARTMENT_HEAD: "Department Head",
  SUPER_ADMIN: "Super Admin",
};