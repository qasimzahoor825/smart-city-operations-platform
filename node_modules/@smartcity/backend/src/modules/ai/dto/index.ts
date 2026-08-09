export interface CategorizeDto {
  title: string;
  description: string;
}

export interface AICategorization {
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  departmentId: string | null;
  departmentName: string | null;
  summary: string;
  source: "gemini" | "heuristic" | "error";
}