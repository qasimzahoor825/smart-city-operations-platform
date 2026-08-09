export interface NewsQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  published?: boolean;
}

export interface CreateNewsDto {
  title: string;
  summary: string;
  content: string;
  category: string;
  published?: boolean;
  publishedAt?: string;
}

export interface UpdateNewsDto {
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  published?: boolean;
}

export interface NewsStats {
  total: number;
  published: number;
  drafts: number;
  byCategory: Record<string, number>;
  byAuthor: Record<string, number>;
  lastPublishedAt: string | null;
}

export interface Actor {
  id: string;
  email: string;
  role: string;
}