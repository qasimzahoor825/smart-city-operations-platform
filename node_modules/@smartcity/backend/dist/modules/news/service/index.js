"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsService = void 0;
const common_1 = require("@smartcity/common");
const utils_1 = require("../../../core/utils");
const repository_1 = require("../../auth/repository");
const repository_2 = require("../repository");
const STAFF_ROLES = ["SUPER_ADMIN", "OFFICER", "DEPARTMENT_HEAD"];
function isStaff(role) {
    return STAFF_ROLES.includes(role);
}
function buildSlug(title) {
    const base = (0, utils_1.toSlug)(title) || `article-${Date.now().toString(36)}`;
    if (!repository_2.newsRepository.findBySlug(base))
        return base;
    return `${base}-${Date.now().toString(36).slice(-4)}`;
}
exports.newsService = {
    async list(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const q = (query.search ?? "").trim().toLowerCase();
        const items = repository_2.newsRepository.articles.query({
            searchFields: ["title", "summary", "category"],
            search: q || undefined,
            filter: (a) => (query.published === undefined ? a.published === true : a.published === query.published) &&
                (query.category === undefined || a.category.toLowerCase() === query.category.toLowerCase()),
            sort: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async getById(id, actor) {
        const article = repository_2.newsRepository.articles.findById(id);
        if (!article)
            throw new common_1.NotFoundError("Article not found");
        if (!article.published && !isStaff(actor.role)) {
            throw new common_1.ForbiddenError("This article is not published yet");
        }
        return article;
    },
    async create(dto, actor) {
        const title = (dto.title ?? "").trim();
        const summary = (dto.summary ?? "").trim();
        const content = (dto.content ?? "").trim();
        const category = (dto.category ?? "").trim();
        if (!title)
            throw new common_1.ValidationError({ title: "title is required" });
        if (!summary)
            throw new common_1.ValidationError({ summary: "summary is required" });
        if (!content)
            throw new common_1.ValidationError({ content: "content is required" });
        if (!category)
            throw new common_1.ValidationError({ category: "category is required" });
        const user = repository_1.authRepository.users.findById(actor.id);
        const now = new Date().toISOString();
        const published = dto.published ?? false;
        return repository_2.newsRepository.articles.create({
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
        });
    },
    async update(id, dto) {
        const article = repository_2.newsRepository.articles.findById(id);
        if (!article)
            throw new common_1.NotFoundError("Article not found");
        const patch = { updatedAt: new Date().toISOString() };
        if (dto.title !== undefined) {
            const title = dto.title.trim();
            if (!title)
                throw new common_1.ValidationError({ title: "title is required" });
            patch.title = title;
            patch.slug = buildSlug(title);
        }
        if (dto.summary !== undefined)
            patch.summary = dto.summary.trim();
        if (dto.content !== undefined)
            patch.content = dto.content.trim();
        if (dto.category !== undefined)
            patch.category = dto.category.trim();
        if (dto.published !== undefined) {
            patch.published = dto.published;
            patch.publishedAt = dto.published ? article.publishedAt ?? new Date().toISOString() : null;
        }
        const updated = repository_2.newsRepository.articles.update(id, patch);
        if (!updated)
            throw new common_1.NotFoundError("Article not found");
        return updated;
    },
    async remove(id) {
        const article = repository_2.newsRepository.articles.findById(id);
        if (!article)
            throw new common_1.NotFoundError("Article not found");
        repository_2.newsRepository.articles.delete(id);
    },
    async stats() {
        const articles = repository_2.newsRepository.articles.all();
        const published = articles.filter((a) => a.published);
        const byCategory = {};
        const byAuthor = {};
        articles.forEach((a) => {
            byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
            byAuthor[a.authorName] = (byAuthor[a.authorName] ?? 0) + 1;
        });
        const publishedSorted = [...published].sort((a, b) => new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime());
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
exports.default = exports.newsService;
//# sourceMappingURL=index.js.map