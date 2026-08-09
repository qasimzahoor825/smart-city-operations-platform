"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slaService = void 0;
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
/**
 * Default SLA hours by priority when no configurable rule matches. These act
 * only as a fallback — real SLA values MUST come from the `sla_rules`
 * collection (seeded at boot) so they can be tuned per department/category
 * without code changes.
 */
const DEFAULT_SLA_HOURS = {
    [common_1.ComplaintPriority.LOW]: 72,
    [common_1.ComplaintPriority.MEDIUM]: 48,
    [common_1.ComplaintPriority.HIGH]: 24,
    [common_1.ComplaintPriority.CRITICAL]: 4,
};
exports.slaService = {
    /**
     * Resolve the number of SLA hours for a complaint. Matching order:
     *   1. department + category + priority
     *   2. department + priority
     *   3. category + priority
     *   4. priority-only rule
     *   5. built-in defaults
     */
    async resolveHours(input) {
        const rules = repository_1.slaRepository.rules.all().filter((r) => r.active);
        const category = (input.category ?? "").trim().toUpperCase();
        const departmentId = input.departmentId ?? null;
        const priority = input.priority;
        const byDeptCategory = rules.find((r) => r.priority === priority && r.departmentId === departmentId && r.category?.toUpperCase() === category);
        const byDept = rules.find((r) => r.priority === priority && r.departmentId === departmentId && !r.category);
        const byCategory = rules.find((r) => r.priority === priority && !r.departmentId && r.category?.toUpperCase() === category);
        const byPriority = rules.find((r) => r.priority === priority && !r.departmentId && !r.category);
        const matched = byDeptCategory ?? byDept ?? byCategory ?? byPriority;
        if (matched)
            return matched.hours;
        return DEFAULT_SLA_HOURS[priority] ?? DEFAULT_SLA_HOURS[common_1.ComplaintPriority.MEDIUM];
    },
    async list() {
        return repository_1.slaRepository.rules.all().sort((a, b) => a.priority.localeCompare(b.priority));
    },
    async upsert(rule) {
        const existing = repository_1.slaRepository.rules.findById(rule.id);
        if (existing) {
            return repository_1.slaRepository.rules.update(rule.id, { ...rule });
        }
        return repository_1.slaRepository.rules.create(rule);
    },
};
exports.default = exports.slaService;
//# sourceMappingURL=index.js.map