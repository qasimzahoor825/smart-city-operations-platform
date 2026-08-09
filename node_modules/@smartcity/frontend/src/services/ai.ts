import api from "@/services/api-client";
import type { ApiResponse } from "@/types";

export interface AICategorization {
  category: string;
  priority: string;
  departmentId: string | null;
  departmentName: string | null;
  summary: string;
  source: "gemini" | "heuristic" | "error";
}

export const aiApi = {
  async categorize(title: string, description: string): Promise<AICategorization | null> {
    const { data } = await api.post<ApiResponse<AICategorization>>("/ai/categorize", {
      title,
      description,
    });
    return data.data ?? null;
  },
};