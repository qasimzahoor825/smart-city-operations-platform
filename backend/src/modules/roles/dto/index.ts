import { UserRole } from "@smartcity/common";

export interface PermissionClaim {
  resource: string;
  action: "create" | "read" | "update" | "delete" | "assign" | "manage";
  scope: string;
}

export interface RoleInfo {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
  claims: PermissionClaim[];
}