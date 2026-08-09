"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citizenService = void 0;
const common_1 = require("@smartcity/common");
const utils_1 = require("../../../core/utils");
const repository_1 = require("../repository");
const OPEN_STATUSES = new Set(["SUBMITTED", "ASSIGNED"]);
const IN_PROGRESS_STATUSES = new Set(["IN_PROGRESS"]);
const RESOLVED_STATUSES = new Set(["RESOLVED", "CLOSED"]);
// Citizens share the "users" collection with auth. Records without a role
// (legacy seeds in tests) are treated as citizens for backwards compatibility.
function isCitizen(c) {
    return c.role === undefined || c.role === common_1.UserRole.CITIZEN;
}
function satisfactionOf(complaints) {
    if (complaints.length === 0)
        return 100;
    const resolved = complaints.filter((c) => RESOLVED_STATUSES.has(c.status)).length;
    return Math.round((resolved / complaints.length) * 100);
}
exports.citizenService = {
    async list(options = {}) {
        const { page = 1, limit = 20, search, ward } = options;
        let citizens = repository_1.citizenRepository.citizens
            .all()
            .filter(isCitizen)
            .map((c) => repository_1.citizenRepository.toProfile(c));
        if (ward)
            citizens = citizens.filter((c) => c.ward?.toLowerCase() === ward.toLowerCase());
        if (search) {
            const q = search.trim().toLowerCase();
            citizens = citizens.filter((c) => c.fullName.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.ward ?? "").toLowerCase().includes(q));
        }
        return (0, utils_1.paginate)(citizens, page, limit);
    },
    async getById(id) {
        const citizen = repository_1.citizenRepository.citizens.findById(id);
        if (!citizen || !isCitizen(citizen))
            throw new common_1.AppError("Citizen not found", 404);
        return repository_1.citizenRepository.toProfile(citizen);
    },
    async updateProfile(id, dto) {
        const existing = repository_1.citizenRepository.citizens.findById(id);
        if (!existing || !isCitizen(existing))
            throw new common_1.AppError("Citizen not found", 404);
        const patch = {};
        if (dto.fullName !== undefined)
            patch.fullName = dto.fullName;
        if (dto.phoneNumber !== undefined)
            patch.phoneNumber = dto.phoneNumber;
        if (dto.avatar !== undefined)
            patch.avatar = dto.avatar;
        if (dto.ward !== undefined)
            patch.ward = dto.ward;
        if (dto.district !== undefined)
            patch.district = dto.district;
        patch.updatedAt = new Date().toISOString();
        const updated = repository_1.citizenRepository.citizens.update(id, patch);
        return repository_1.citizenRepository.toProfile(updated);
    },
    async getStats(id) {
        const citizen = repository_1.citizenRepository.citizens.findById(id);
        if (!citizen || !isCitizen(citizen))
            throw new common_1.AppError("Citizen not found", 404);
        const owned = repository_1.citizenRepository.complaints.all().filter((c) => c.citizenId === id);
        const openComplaints = owned.filter((c) => OPEN_STATUSES.has(c.status)).length;
        const inProgressComplaints = owned.filter((c) => IN_PROGRESS_STATUSES.has(c.status)).length;
        const resolvedComplaints = owned.filter((c) => RESOLVED_STATUSES.has(c.status)).length;
        return {
            totalComplaints: owned.length,
            openComplaints,
            inProgressComplaints,
            resolvedComplaints,
            joinedAt: citizen.createdAt,
            lastActivityAt: citizen.lastLoginAt ?? null,
            satisfactionScore: satisfactionOf(owned),
        };
    },
    async overview() {
        const all = repository_1.citizenRepository.citizens.all().filter(isCitizen);
        const registered = repository_1.citizenRepository.complaints.all();
        return {
            totalCitizens: all.length,
            verifiedCitizens: all.filter((c) => c.isEmailVerified).length,
            activeCitizens: all.filter((c) => c.isActive).length,
            totalComplaints: registered.length,
            openComplaints: registered.filter((c) => OPEN_STATUSES.has(c.status)).length,
            resolvedComplaints: registered.filter((c) => RESOLVED_STATUSES.has(c.status)).length,
        };
    },
};
exports.default = exports.citizenService;
//# sourceMappingURL=index.js.map