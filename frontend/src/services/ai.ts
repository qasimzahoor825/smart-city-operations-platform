import api from "@/services/api-client";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/config/env";
import type { ApiResponse } from "@/types";

export interface AICategorization {
  category: string;
  priority: string;
  departmentId: string | null;
  departmentName: string | null;
  summary: string;
  source: "gemini" | "openrouter" | "heuristic" | "error";
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AIChatReply {
  reply: string;
  source: "gemini" | "openrouter" | "heuristic";
  intent?: string;
  suggestions?: string[];
}

export interface ImageValidationResult {
  accepted: boolean;
  reason: string;
  source: "gemini" | "heuristic";
}

interface ChatStreamHandlers {
  onMeta?: (meta: { intent?: string; suggestions?: string[]; source: string }) => void;
  onDelta: (text: string) => void;
}

export const aiApi = {
  async categorize(title: string, description: string): Promise<AICategorization | null> {
    const { data } = await api.post<ApiResponse<AICategorization>>("/ai/categorize", {
      title,
      description,
    });
    return data.data ?? null;
  },

  async chat(message: string, history: ChatTurn[] = []): Promise<AIChatReply | null> {
    const { data } = await api.post<ApiResponse<AIChatReply>>("/ai/chat", { message, history });
    return data.data ?? null;
  },

  async validateImage(imageDataUrl: string, category: string): Promise<ImageValidationResult | null> {
    const { data } = await api.post<ApiResponse<ImageValidationResult>>("/ai/validate-image", {
      imageDataUrl,
      category,
    });
    return data.data ?? null;
  },

  async chatStream(message: string, history: ChatTurn[] = [], handlers: ChatStreamHandlers): Promise<void> {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
    const res = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok || !res.body) throw new Error(`stream request failed (${res.status})`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";
      for (const block of blocks) {
        const event = block.split("\n").find((l) => l.startsWith("event: "))?.slice(7).trim();
        const dataLine = block.split("\n").find((l) => l.startsWith("data: "))?.slice(6).trim();
        if (!dataLine) continue;
        const data = JSON.parse(dataLine) as { intent?: string; suggestions?: string[]; source: string; text?: string; message?: string };
        if (event === "meta") handlers.onMeta?.(data);
        else if (event === "delta" && data.text) handlers.onDelta(data.text);
        else if (event === "error") throw new Error(data.message ?? "stream error");
      }
    }
  },
};