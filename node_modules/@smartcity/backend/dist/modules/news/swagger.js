"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsSwagger = void 0;
/**
 * @swagger
 * tags:
 *   - name: News
 *     description: Published news feed & editorial workflow
 *
 * @swagger
 * /news:
 *   get:
 *     tags: [News]
 *     summary: List articles (published by default; filter by category/search/published)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: published, in: query, schema: { type: boolean } }
 *     responses:
 *       200:
 *         description: Paginated list of articles
 *   post:
 *     tags: [News]
 *     summary: Create an article (SUPER_ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, summary, content, category]
 *             properties:
 *               title: { type: string }
 *               summary: { type: string }
 *               content: { type: string }
 *               category: { type: string }
 *               published: { type: boolean }
 *     responses:
 *       201:
 *         description: Article created
 *
 * /news/stats:
 *   get:
 *     tags: [News]
 *     summary: Article statistics (total, published, drafts, byCategory, byAuthor)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Article statistics
 *
 * /news/{id}:
 *   get:
 *     tags: [News]
 *     summary: Get a single article (drafts require staff)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Article fetched
 *   patch:
 *     tags: [News]
 *     summary: Update an article (SUPER_ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               summary: { type: string }
 *               content: { type: string }
 *               category: { type: string }
 *               published: { type: boolean }
 *     responses:
 *       200:
 *         description: Article updated
 *   delete:
 *     tags: [News]
 *     summary: Delete an article (SUPER_ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Article deleted
 */
exports.newsSwagger = { tag: "News" };
exports.default = exports.newsSwagger;
//# sourceMappingURL=swagger.js.map