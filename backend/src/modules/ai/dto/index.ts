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
  source: "gemini" | "openrouter" | "heuristic" | "error";
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatDto {
  message: string;
  history?: ChatTurn[];
}

export interface AIChatReply {
  reply: string;
  source: "gemini" | "openrouter" | "heuristic";
  intent?: string;
  suggestions?: string[];
}

export interface ValidateImageDto {
  imageDataUrl: string;
  category: string;
}

export interface ImageValidationResult {
  accepted: boolean;
  reason: string;
  source: "gemini" | "heuristic";
}