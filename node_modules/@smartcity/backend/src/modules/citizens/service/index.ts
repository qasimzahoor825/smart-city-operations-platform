import { AppError, UserRole } from "@smartcity/common";
import { paginate } from "../../../core/utils";
import { citizenRepository, type CitizenRecord, type SeedComplaint } from "../repository";
import type {
  CitizenProfile,
  CitizenStats,
  CitizensOverview,
  ListCitizensOptions,
  PaginatedCitizens,
  UpdateCitizenProfileDto,
} from "../dto";

const OPEN_STATUSES = new Set(["SUBMITTED", "ASSIGNED"]);
const IN_PROGRESS_STATUSES = new Set(["IN_PROGRESS"]);
const RESOLVED_STATUSES = new Set(["RESOLVED", "CLOSED"]);

// Citizens share the "users" collection with auth. Records without a role
// (legacy seeds in tests) are treated as citizens for backwards compatibility.
function isCitizen(c: CitizenRecord): boolean {
  return c.role === undefined || c.role === UserRole.CITIZEN;
}

function satisfactionOf(complaints: SeedComplaint[]): number {
  if (complaints.length === 0) return 100;
  const resolved = complaints.filter((c) => RESOLVED_STATUSES.has(c.status)).length;
  return Math.round((resolved / complaints.length) * 100);
}

export const citizenService = {
  async list(options: ListCitizensOptions = {}): Promise<PaginatedCitizens> {
    const { page = 1, limit = 20, search, ward } = options;
    let citizens = citizenRepository.citizens
      .all()
      .filter(isCitizen)
      .map((c) => citizenRepository.toProfile(c));

    if (ward) citizens = citizens.filter((c) => c.ward?.toLowerCase() === ward.toLowerCase());
    if (search) {
      const q = search.trim().toLowerCase();
      citizens = citizens.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.ward ?? "").toLowerCase().includes(q),
      );
    }
    return paginate(citizens, page, limit);
  },

  async getById(id: string): Promise<CitizenProfile> {
    const citizen = citizenRepository.citizens.findById(id) as CitizenRecord | undefined;
    if (!citizen || !isCitizen(citizen)) throw new AppError("Citizen not found", 404);
    return citizenRepository.toProfile(citizen);
  },

  async updateProfile(id: string, dto: UpdateCitizenProfileDto): Promise<CitizenProfile> {
    const existing = citizenRepository.citizens.findById(id) as CitizenRecord | undefined;
    if (!existing || !isCitizen(existing)) throw new AppError("Citizen not found", 404);

    const patch: Partial<CitizenRecord> = {};
    if (dto.fullName !== undefined) patch.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) patch.phoneNumber = dto.phoneNumber;
    if (dto.avatar !== undefined) patch.avatar = dto.avatar;
    if (dto.ward !== undefined) patch.ward = dto.ward;
    if (dto.district !== undefined) patch.district = dto.district;
    patch.updatedAt = new Date().toISOString();

    const updated = citizenRepository.citizens.update(id, patch) as CitizenRecord;
    return citizenRepository.toProfile(updated);
  },

  async getStats(id: string): Promise<CitizenStats> {
    const citizen = citizenRepository.citizens.findById(id) as CitizenRecord | undefined;
    if (!citizen || !isCitizen(citizen)) throw new AppError("Citizen not found", 404);

    const owned = citizenRepository.complaints.all().filter((c) => c.citizenId === id);
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

  async overview(): Promise<CitizensOverview> {
    const all = citizenRepository.citizens.all().filter(isCitizen);
    const registered = citizenRepository.complaints.all();
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

export default citizenService;