import { AppError, ConflictError, uid } from "@smartcity/common";
import type { Pagination } from "@smartcity/common";
import { paginate } from "../../../core/utils";
import { departmentRepository, type DepartmentRecord } from "../repository";
import type {
  AssignOfficersDto,
  CreateDepartmentDto,
  DepartmentDto,
  DepartmentStats,
  ListDepartmentsOptions,
  PaginatedDepartments,
  PublicDepartmentDto,
  UpdateDepartmentDto,
} from "../dto";

const OPEN_STATUSES = new Set(["SUBMITTED", "ASSIGNED"]);
const IN_PROGRESS_STATUSES = new Set(["IN_PROGRESS"]);
const RESOLVED_STATUSES = new Set(["RESOLVED", "CLOSED"]);

export const departmentService = {
  async list(options: ListDepartmentsOptions = {}): Promise<PaginatedDepartments> {
    const { page = 1, limit = 20, search } = options;
    let departments = departmentRepository.departments.all().map((d) => this.toDto(d));

    if (search) {
      const q = search.trim().toLowerCase();
      departments = departments.filter(
        (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
      );
    }
    return paginate(departments, page, limit);
  },

  /** Public feed: name/code/description only — no member emails, no auth required. */
  async listPublic(options: ListDepartmentsOptions = {}): Promise<{ items: PublicDepartmentDto[]; pagination: Pagination }> {
    const { page = 1, limit = 50 } = options;
    const items: PublicDepartmentDto[] = departmentRepository.departments
      .all()
      .map((d) => this.toPublicDto(d))
      .sort((a, b) => a.name.localeCompare(b.name));
    return paginate(items, page, limit);
  },

  async getById(id: string): Promise<DepartmentDto> {
    const department = departmentRepository.departments.findById(id) as DepartmentRecord | undefined;
    if (!department) throw new AppError("Department not found", 404);
    return this.toDto(department);
  },

  async create(dto: CreateDepartmentDto): Promise<DepartmentDto> {
    const name = dto.name.trim();
    const code = dto.code.trim().toUpperCase();

    if (departmentRepository.findByName(name)) throw new ConflictError("Department name already in use");
    if (departmentRepository.findByCode(code)) throw new ConflictError("Department code already in use");

    const nowIso = new Date().toISOString();
    const created = departmentRepository.departments.create({
      id: uid("dept"),
      name,
      code,
      description: dto.description ?? null,
      managerId: null,
      members: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    }) as DepartmentRecord;
    return this.toDto(created);
  },

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentDto> {
    const existing = departmentRepository.departments.findById(id) as DepartmentRecord | undefined;
    if (!existing) throw new AppError("Department not found", 404);

    const patch: Partial<DepartmentRecord> = {};
    if (dto.name !== undefined) {
      const clash = departmentRepository.findByName(dto.name);
      if (clash && clash.id !== id) throw new ConflictError("Department name already in use");
      patch.name = dto.name.trim();
    }
    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();
      const clash = departmentRepository.findByCode(code);
      if (clash && clash.id !== id) throw new ConflictError("Department code already in use");
      patch.code = code;
    }
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.managerId !== undefined) patch.managerId = dto.managerId;
    patch.updatedAt = new Date().toISOString();

    const updated = departmentRepository.departments.update(id, patch) as DepartmentRecord;
    return this.toDto(updated);
  },

  async remove(id: string): Promise<void> {
    const department = departmentRepository.departments.findById(id) as DepartmentRecord | undefined;
    if (!department) throw new AppError("Department not found", 404);
    if (department.members.length > 0) {
      throw new ConflictError("Reassign or remove officers before deleting the department");
    }
    departmentRepository.departments.delete(id);
  },

  async getStats(id: string): Promise<DepartmentStats> {
    const department = departmentRepository.departments.findById(id) as DepartmentRecord | undefined;
    if (!department) throw new AppError("Department not found", 404);

    const owned = departmentRepository.complaints.all().filter((c) => c.departmentId === id);
    const citizenCount = new Set(owned.map((c) => c.citizenId)).size;

    return {
      departmentId: department.id,
      departmentName: department.name,
      departmentCode: department.code,
      officerCount: department.members.length,
      totalComplaints: owned.length,
      openComplaints: owned.filter((c) => OPEN_STATUSES.has(c.status)).length,
      inProgressComplaints: owned.filter((c) => IN_PROGRESS_STATUSES.has(c.status)).length,
      resolvedComplaints: owned.filter((c) => RESOLVED_STATUSES.has(c.status)).length,
      citizenCount,
      updatedAt: new Date().toISOString(),
    };
  },

  async assignOfficers(id: string, dto: AssignOfficersDto): Promise<DepartmentDto> {
    const department = departmentRepository.departments.findById(id) as DepartmentRecord | undefined;
    if (!department) throw new AppError("Department not found", 404);

    const candidates = dto.officerIds.map((userId) =>
      departmentRepository.officerPool.find((o) => o.userId === userId),
    );

    const nowIso = new Date().toISOString();
    const existingIds = new Set(department.members.map((m) => m.userId));
    const members = [...department.members];

    candidates.forEach((candidate) => {
      if (!candidate || existingIds.has(candidate.userId)) return;
      members.push({
        userId: candidate.userId,
        fullName: candidate.fullName,
        email: candidate.email,
        role: candidate.role,
        joinedAt: nowIso,
      });
    });

    const updated = departmentRepository.departments.update(id, {
      members,
      updatedAt: nowIso,
    }) as DepartmentRecord;
    return this.toDto(updated);
  },

  toDto(department: DepartmentRecord): DepartmentDto {
    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description ?? null,
      managerId: department.managerId ?? null,
      members: department.members,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  },

  toPublicDto(department: DepartmentRecord): PublicDepartmentDto {
    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description ?? null,
      createdAt: department.createdAt,
    };
  },
};

export default departmentService;