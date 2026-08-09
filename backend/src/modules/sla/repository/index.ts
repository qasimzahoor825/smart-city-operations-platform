import { collection } from "../../../core/database/repository";

export interface StoredSlaRule {
  id: string;
  name: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string | null;
  departmentId: string | null;
  hours: number;
  active: boolean;
}

export const slaRepository = {
  rules: collection<StoredSlaRule>("sla_rules"),
  async reset(): Promise<void> {
    slaRepository.rules.seed([]);
  },
};

export default slaRepository;