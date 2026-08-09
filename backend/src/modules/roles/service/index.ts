import { NotFoundError } from "@smartcity/common";
import { UserRole } from "@smartcity/common";
import { roleRepository } from "../repository";
import type { RoleInfo } from "../dto";

export const roleService = {
  list(): RoleInfo[] {
    return roleRepository.roles.all();
  },

  get(role: string): RoleInfo {
    const info = roleRepository.findByRole(role as UserRole);
    if (!info) throw new NotFoundError(`Role ${role} not found`);
    return info;
  },
};

export default roleService;