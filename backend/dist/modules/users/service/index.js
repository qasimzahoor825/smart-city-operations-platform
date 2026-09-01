"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const common_1 = require("@smartcity/common");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../../../core/utils");
const repository_1 = require("../repository");
const repository_2 = require("../../departments/repository");
/** Flatten the stored record into the shape the frontend consumes. */
function decorate(user) {
    const departmentName = user.departmentId
        ? repository_2.departmentRepository.departments.findById(user.departmentId)?.name ?? null
        : null;
    return {
        ...user,
        active: user.isActive ?? true,
        departmentName,
    };
}
exports.userService = {
    async list(options = {}) {
        const { page = 1, limit = 20, role, search, departmentId } = options;
        let items = repository_1.userRepository.users.all().map((u) => decorate(repository_1.userRepository.toPublic(u)));
        if (role)
            items = items.filter((u) => u.role === role);
        if (departmentId)
            items = items.filter((u) => u.departmentId === departmentId);
        if (search) {
            const q = search.trim().toLowerCase();
            items = items.filter((u) => u.fullName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.phoneNumber ?? "").toLowerCase().includes(q));
        }
        return (0, utils_1.paginate)(items, page, limit);
    },
    async getById(id) {
        const user = repository_1.userRepository.users.findById(id);
        if (!user)
            throw new common_1.AppError("User not found", 404);
        return decorate(repository_1.userRepository.toPublic(user));
    },
    async create(dto) {
        const fullName = (dto.fullName ?? "").trim();
        const email = (dto.email ?? "").trim().toLowerCase();
        if (!fullName || !email)
            throw new common_1.AppError("fullName and email are required", 422);
        if (repository_1.userRepository.findByEmail(email))
            throw new common_1.ConflictError("Email is already associated with another account");
        const now = new Date().toISOString();
        const password = dto.password || "Provisioned@1234";
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const created = repository_1.userRepository.users.create({
            fullName,
            email,
            passwordHash,
            phoneNumber: dto.phoneNumber ?? null,
            role: dto.role ?? "CITIZEN",
            departmentId: dto.departmentId ?? null,
            avatar: null,
            isEmailVerified: dto.isEmailVerified ?? true,
            isActive: dto.active ?? true,
            createdAt: now,
            updatedAt: now,
        });
        return created;
    },
    async update(id, dto) {
        const existing = repository_1.userRepository.users.findById(id);
        if (!existing)
            throw new common_1.AppError("User not found", 404);
        const patch = {};
        if (dto.fullName !== undefined)
            patch.fullName = dto.fullName;
        if (dto.phoneNumber !== undefined)
            patch.phoneNumber = dto.phoneNumber;
        if (dto.role !== undefined)
            patch.role = dto.role;
        if (dto.departmentId !== undefined)
            patch.departmentId = dto.departmentId;
        if (dto.avatar !== undefined)
            patch.avatar = dto.avatar;
        if (dto.isEmailVerified !== undefined)
            patch.isEmailVerified = dto.isEmailVerified;
        if (dto.email !== undefined) {
            const email = dto.email.trim().toLowerCase();
            const clash = repository_1.userRepository.findByEmail(email);
            if (clash && clash.id !== id)
                throw new common_1.ConflictError("Email is already associated with another account");
            patch.email = email;
        }
        patch.updatedAt = new Date().toISOString();
        const updated = repository_1.userRepository.users.update(id, patch);
        if (!updated)
            throw new common_1.AppError("User not found", 404);
        return repository_1.userRepository.toPublic(updated);
    },
    async setActive(id, isActive) {
        const user = repository_1.userRepository.users.findById(id);
        if (!user)
            throw new common_1.AppError("User not found", 404);
        const updated = repository_1.userRepository.users.update(id, {
            isActive,
            updatedAt: new Date().toISOString(),
        });
        return repository_1.userRepository.toPublic(updated);
    },
    async remove(id) {
        const user = repository_1.userRepository.users.findById(id);
        if (!user)
            throw new common_1.AppError("User not found", 404);
        repository_1.userRepository.users.delete(id);
    },
};
exports.default = exports.userService;
//# sourceMappingURL=index.js.map