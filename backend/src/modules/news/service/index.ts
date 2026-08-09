import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  paginate,
  type Pagination,
} from "@smartcity/common";
import { toSlug } from "../../../core/utils";
import { authRepository } from "../../auth/repository";
import { newsRepository, type StoredNewsArticle } from "../repository";
import type { Actor, CreateNewsDto, NewsQuery, NewsStats, UpdateNewsDto } from "../dto";

const STAFF_ROLES = ["SUPER_ADMIN", "OFFICER", "DEPARTMENT_HEAD"];

function isStaff(role: string): boolean {
  return (STAFF_ROLES as string[]).includes(role);
}

function buildSlug(title: string): string {
  const base = toSlug(title) || `article-${Date.now().toString(36)}`;
  if (!newsRepository.findBySlug(base)) return base;
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}

export const newsService = {
  async list(query: NewsQuery = {}): Promise<{ items: StoredNewsArticle[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const q = (query.search ?? "").trim().toLowerCase();
    const items = newsRepository.articles.query({
      searchFields: ["title", "summary", "category"],
      search: q || undefined,
      filter: (a) =>
        (query.published === undefined ? a.published === true : a.published === query.published) &&
        (query.category === undefined || a.category.toLowerCase() === query.category.toLowerCase()),
      sort: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async getById(id: string, actor: Actor): Promise<StoredNewsArticle> {
    const article = newsRepository.articles.findById(id);
    if (!article) throw new NotFoundError("Article not found");
    if (!article.published && !isStaff(actor.role)) {
      throw new ForbiddenError("This article is not published yet");
    }
    return article;
  },

  async create(dto: CreateNewsDto, actor: Actor): Promise<StoredNewsArticle> {
    const title = (dto.title ?? "").trim();
    const summary = (dto.summary ?? "").trim();
    const content = (dto.content ?? "").trim();
    const category = (dto.category ?? "").trim();
    if (!title) throw new ValidationError({ title: "title is required" });
    if (!summary) throw new ValidationError({ summary: "summary is required" });
    if (!content) throw new ValidationError({ content: "content is required" });
    if (!category) throw new ValidationError({ category: "category is required" });

    const user = authRepository.users.findById(actor.id);
    const now = new Date().toISOString();
    const published = dto.published ?? false;
    return newsRepository.articles.create({
      slug: buildSlug(title),
      title,
      summary,
      content,
      category,
      authorId: actor.id,
      authorName: user?.fullName ?? actor.email,
      published,
      publishedAt: published ? dto.publishedAt ?? now : null,
      createdAt: now,
      updatedAt: now,
    } as unknown as StoredNewsArticle);
  },

  async update(id: string, dto: UpdateNewsDto): Promise<StoredNewsArticle> {
    const article = newsRepository.articles.findById(id);
    if (!article) throw new NotFoundError("Article not found");
    const patch: Partial<StoredNewsArticle> = { updatedAt: new Date().toISOString() };
    if (dto.title !== undefined) {
      const title = dto.title.trim();
      if (!title) throw new ValidationError({ title: "title is required" });
      patch.title = title;
      patch.slug = buildSlug(title);
    }
    if (dto.summary !== undefined) patch.summary = dto.summary.trim();
    if (dto.content !== undefined) patch.content = dto.content.trim();
    if (dto.category !== undefined) patch.category = dto.category.trim();
    if (dto.published !== undefined) {
      patch.published = dto.published;
      patch.publishedAt = dto.published ? article.publishedAt ?? new Date().toISOString() : null;
    }
    const updated = newsRepository.articles.update(id, patch);
    if (!updated) throw new NotFoundError("Article not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    const article = newsRepository.articles.findById(id);
    if (!article) throw new NotFoundError("Article not found");
    newsRepository.articles.delete(id);
  },

  async stats(): Promise<NewsStats> {
    const articles = newsRepository.articles.all();
    const published = articles.filter((a) => a.published);
    const byCategory: Record<string, number> = {};
    const byAuthor: Record<string, number> = {};
    articles.forEach((a) => {
      byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
      byAuthor[a.authorName] = (byAuthor[a.authorName] ?? 0) + 1;
    });
    const publishedSorted = [...published].sort(
      (a, b) => new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime(),
    );
    return {
      total: articles.length,
      published: published.length,
      drafts: articles.length - published.length,
      byCategory,
      byAuthor,
      lastPublishedAt: publishedSorted.length ? publishedSorted[publishedSorted.length - 1].publishedAt : null,
    };
  },
};

export default newsService;