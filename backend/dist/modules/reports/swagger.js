"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsSwagger = void 0;
/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Aggregated operational reports, analytics & exports
 *
 * @swagger
 * /reports/overview:
 *   get:
 *     tags: [Reports]
 *     summary: High-level platform counts (departments, officers, assets, complaints, emergencies, appointments)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Report overview
 *
 * /reports/analytics:
 *   get:
 *     tags: [Reports]
 *     summary: Complaint analytics (resolution rate, average resolution hours, SLA breaches, by-department)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Report analytics
 *
 * /reports/export:
 *   get:
 *     tags: [Reports]
 *     summary: Export overview + analytics (format=json|csv)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: format, in: query, required: false, schema: { type: string, enum: [json, csv] } }
 *     responses:
 *       200:
 *         description: Report data (object for json, CSV string for csv)
 */
exports.reportsSwagger = { tag: "Reports" };
exports.default = exports.reportsSwagger;
//# sourceMappingURL=swagger.js.map