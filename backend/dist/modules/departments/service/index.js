"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = void 0;
const common_1 = require("@smartcity/common");
const utils_1 = require("../../../core/utils");
const repository_1 = require("../repository");
const OPEN_STATUSES = new Set(["SUBMITTED", "ASSIGNED"]);
const IN_PROGRESS_STATUSES = new Set(["IN_PROGRESS"]);
const RESOLVED_STATUSES = new Set(["RESOLVED", "CLOSED"]);
exports.departmentService = {
    async list(options = {}) {
        const { page = 1, limit = 20, search } = options;
        let departments = repository_1.departmentRepository.departments.all().map((d) => this.toDto(d));
        if (search) {
            const q = search.trim().toLowerCase();
            departments = departments.filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
        }
        return (0, utils_1.paginate)(departments, page, limit);
    },
    /** Public feed: name/code/description only — no member emails, no auth required. */
    async listPublic(options = {}) {
        const { page = 1, limit = 50 } = options;
        const items = repository_1.departmentRepository.departments
            .all()
            .map((d) => this.toPublicDto(d))
            .sort((a, b) => a.name.localeCompare(b.name));
        return (0, utils_1.paginate)(items, page, limit);
    },
    async getById(id) {
        const department = repository_1.departmentRepository.departments.findById(id);
        if (!department)
            throw new common_1.AppError("Department not found", 404);
        return this.toDto(department);
    },
    async create(dto) {
        const name = dto.name.trim();
        const code = dto.code.trim().toUpperCase();
        if (repository_1.departmentRepository.findByName(name))
            throw new common_1.ConflictError("Department name already in use");
        if (repository_1.departmentRepository.findByCode(code))
            throw new common_1.ConflictError("Department code already in use");
        const nowIso = new Date().toISOString();
        const created = repository_1.departmentRepository.departments.create({
            id: (0, common_1.uid)("dept"),
            name,
            code,
            description: dto.description ?? null,
            managerId: null,
            members: [],
            createdAt: nowIso,
            updatedAt: nowIso,
        });
        return this.toDto(created);
    },
    async update(id, dto) {
        const existing = repository_1.departmentRepository.departments.findById(id);
        if (!existing)
            throw new common_1.AppError("Department not found", 404);
        const patch = {};
        if (dto.name !== undefined) {
            const clash = repository_1.departmentRepository.findByName(dto.name);
            if (clash && clash.id !== id)
                throw new common_1.ConflictError("Department name already in use");
            patch.name = dto.name.trim();
        }
        if (dto.code !== undefined) {
            const code = dto.code.trim().toUpperCase();
            const clash = repository_1.departmentRepository.findByCode(code);
            if (clash && clash.id !== id)
                throw new common_1.ConflictError("Department code already in use");
            patch.code = code;
        }
        if (dto.description !== undefined)
            patch.description = dto.description;
        if (dto.managerId !== undefined)
            patch.managerId = dto.managerId;
        patch.updatedAt = new Date().toISOString();
        const updated = repository_1.departmentRepository.departments.update(id, patch);
        return this.toDto(updated);
    },
    async remove(id) {
        const department = repository_1.departmentRepository.departments.findById(id);
        if (!department)
            throw new common_1.AppError("Department not found", 404);
        if (department.members.length > 0) {
            throw new common_1.ConflictError("Reassign or remove officers before deleting the department");
        }
        repository_1.departmentRepository.departments.delete(id);
    },
    async getStats(id) {
        const department = repository_1.departmentRepository.departments.findById(id);
        if (!department)
            throw new common_1.AppError("Department not found", 404);
        const owned = repository_1.departmentRepository.complaints.all().filter((c) => c.departmentId === id);
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
    async assignOfficers(id, dto) {
        const department = repository_1.departmentRepository.departments.findById(id);
        if (!department)
            throw new common_1.AppError("Department not found", 404);
        const candidates = dto.officerIds.map((userId) => repository_1.departmentRepository.officerPool.find((o) => o.userId === userId));
        const nowIso = new Date().toISOString();
        const existingIds = new Set(department.members.map((m) => m.userId));
        const members = [...department.members];
        candidates.forEach((candidate) => {
            if (!candidate || existingIds.has(candidate.userId))
                return;
            members.push({
                userId: candidate.userId,
                fullName: candidate.fullName,
                email: candidate.email,
                role: candidate.role,
                joinedAt: nowIso,
            });
        });
        const updated = repository_1.departmentRepository.departments.update(id, {
            members,
            updatedAt: nowIso,
        });
        return this.toDto(updated);
    },
    toDto(department) {
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
    toPublicDto(department) {
        return {
            id: department.id,
            name: department.name,
            code: department.code,
            description: department.description ?? null,
            createdAt: department.createdAt,
        };
    },
};
exports.default = exports.departmentService;
//# sourceMappingURL=index.js.map