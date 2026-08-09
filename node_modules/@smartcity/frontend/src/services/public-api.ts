import { API_BASE_URL } from "@/config/env";

/**
 * Server-side fetch helper for the public (unauthenticated) endpoints used by
 * marketing/content pages. Renders real backend records — departments, news,
 * platform overview stats — and degrades to an explicit empty state instead of
 * emitting fabricated content. A short timeout keeps static export builds from
 * stalling when the API is not reachable.
 */
export async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        signal: controller.signal,
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: T };
      return json.data ?? null;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

export interface PublicNewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  authorName?: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicOverview {
  departments: number;
  officers: number;
  assets: number;
  complaints: number;
  emergencies: number;
  appointments: number;
  generatedAt: string;
}