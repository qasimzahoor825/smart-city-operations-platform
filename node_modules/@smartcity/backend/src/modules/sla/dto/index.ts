export interface SlaRuleDto {
  id: string;
  name: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string | null;
  departmentId: string | null;
  hours: number;
  active: boolean;
}