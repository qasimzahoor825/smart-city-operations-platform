import { AppError, ConflictError } from "@smartcity/common";
import bcrypt from "bcryptjs";
import { paginate } from "../../../core/utils";
import { userRepository, type UserRecord } from "../repository";
import { departmentRepository } from "../../departments/repository";
import type { CreateUserDto, ListUsersOptions, PublicUser, PaginatedUsers, UpdateUserDto } from "../dto";

/** Flatten the stored record into the shape the frontend consumes. */
function decorate(user: PublicUser): PublicUser & { active: boolean; departmentName?: string | null } {
  const departmentName = user.departmentId
    ? departmentRepository.departments.findById(user.departmentId)?.name ?? null
    : null;
  return {
    ...user,
    active: user.isActive ?? true,
    departmentName,
  };
}

export const userService = {
  async list(options: ListUsersOptions = {}): Promise<PaginatedUsers> {
    const { page = 1, limit = 20, role, search, departmentId } = options;
    let items = userRepository.users.all().map((u) => decorate(userRepository.toPublic(u)));

    if (role) items = items.filter((u) => u.role === role);
    if (departmentId) items = items.filter((u) => u.departmentId === departmentId);
    if (search) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phoneNumber ?? "").toLowerCase().includes(q),
      );
    }
    return paginate(items, page, limit);
  },

  async getById(id: string): Promise<PublicUser> {
    const user = userRepository.users.findById(id) as UserRecord | undefined;
    if (!user) throw new AppError("User not found", 404);
    return decorate(userRepository.toPublic(user));
  },

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const fullName = (dto.fullName ?? "").trim();
    const email = (dto.email ?? "").trim().toLowerCase();
    if (!fullName || !email) throw new AppError("fullName and email are required", 422);
    if (userRepository.findByEmail(email)) throw new ConflictError("Email is already associated with another account");

    const now = new Date().toISOString();
    const password = dto.password || "Provisioned@1234";
    const passwordHash = await bcrypt.hash(password, 12);
    const created = userRepository.users.create({
      fullName,
      email,
      passwordHash,
      phoneNumber: dto.phoneNumber ?? null,
      role: dto.role ?? "CITIZEN" as UserRecord["role"],
      departmentId: dto.departmentId ?? null,
      avatar: null,
      isEmailVerified: dto.isEmailVerified ?? true,
      isActive: dto.active ?? true,
      createdAt: now,
      updatedAt: now,
    } as UserRecord);

    return created;
  },

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const existing = userRepository.users.findById(id) as UserRecord | undefined;
    if (!existing) throw new AppError("User not found", 404);

    const patch: Partial<UserRecord> = {};
    if (dto.fullName !== undefined) patch.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) patch.phoneNumber = dto.phoneNumber;
    if (dto.role !== undefined) patch.role = dto.role;
    if (dto.departmentId !== undefined) patch.departmentId = dto.departmentId;
    if (dto.avatar !== undefined) patch.avatar = dto.avatar;
    if (dto.isEmailVerified !== undefined) patch.isEmailVerified = dto.isEmailVerified;

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      const clash = userRepository.findByEmail(email);
      if (clash && clash.id !== id) throw new ConflictError("Email is already associated with another account");
      patch.email = email;
    }
    patch.updatedAt = new Date().toISOString();

    const updated = userRepository.users.update(id, patch) as UserRecord | undefined;
    if (!updated) throw new AppError("User not found", 404);
    return userRepository.toPublic(updated);
  },

  async setActive(id: string, isActive: boolean): Promise<PublicUser> {
    const user = userRepository.users.findById(id) as UserRecord | undefined;
    if (!user) throw new AppError("User not found", 404);
    const updated = userRepository.users.update(id, {
      isActive,
      updatedAt: new Date().toISOString(),
    }) as UserRecord;
    return userRepository.toPublic(updated);
  },

  async remove(id: string): Promise<void> {
    const user = userRepository.users.findById(id) as UserRecord | undefined;
    if (!user) throw new AppError("User not found", 404);
    userRepository.users.delete(id);
  },
};

export default userService;