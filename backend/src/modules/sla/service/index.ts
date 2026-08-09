import { ComplaintPriority } from "@smartcity/common";
import { slaRepository, type StoredSlaRule } from "../repository";

/**
 * Default SLA hours by priority when no configurable rule matches. These act
 * only as a fallback — real SLA values MUST come from the `sla_rules`
 * collection (seeded at boot) so they can be tuned per department/category
 * without code changes.
 */
const DEFAULT_SLA_HOURS: Record<ComplaintPriority, number> = {
  [ComplaintPriority.LOW]: 72,
  [ComplaintPriority.MEDIUM]: 48,
  [ComplaintPriority.HIGH]: 24,
  [ComplaintPriority.CRITICAL]: 4,
};

export interface SlaResolutionInput {
  priority: string;
  category?: string | null;
  departmentId?: string | null;
}

export const slaService = {
  /**
   * Resolve the number of SLA hours for a complaint. Matching order:
   *   1. department + category + priority
   *   2. department + priority
   *   3. category + priority
   *   4. priority-only rule
   *   5. built-in defaults
   */
  async resolveHours(input: SlaResolutionInput): Promise<number> {
    const rules = slaRepository.rules.all().filter((r) => r.active);
    const category = (input.category ?? "").trim().toUpperCase();
    const departmentId = input.departmentId ?? null;
    const priority = input.priority as StoredSlaRule["priority"];

    const byDeptCategory = rules.find(
      (r) => r.priority === priority && r.departmentId === departmentId && r.category?.toUpperCase() === category,
    );
    const byDept = rules.find((r) => r.priority === priority && r.departmentId === departmentId && !r.category);
    const byCategory = rules.find(
      (r) => r.priority === priority && !r.departmentId && r.category?.toUpperCase() === category,
    );
    const byPriority = rules.find((r) => r.priority === priority && !r.departmentId && !r.category);

    const matched = byDeptCategory ?? byDept ?? byCategory ?? byPriority;
    if (matched) return matched.hours;

    return DEFAULT_SLA_HOURS[priority] ?? DEFAULT_SLA_HOURS[ComplaintPriority.MEDIUM];
  },

  async list(): Promise<StoredSlaRule[]> {
    return slaRepository.rules.all().sort((a, b) => a.priority.localeCompare(b.priority));
  },

  async upsert(rule: StoredSlaRule): Promise<StoredSlaRule> {
    const existing = slaRepository.rules.findById(rule.id);
    if (existing) {
      return slaRepository.rules.update(rule.id, { ...rule } as StoredSlaRule) as StoredSlaRule;
    }
    return slaRepository.rules.create(rule);
  },
};

export default slaService;