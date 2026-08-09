"use strict";
/**
 * @swagger
 * tags:
 *   name: SLA
 *   description: Service Level Agreement rules and tuning
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.slaSwagger = void 0;
/**
 * @swagger
 * /sla:
 *   get:
 *     tags: [SLA]
 *     summary: List SLA rules
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: SLA rules fetched
 *   post:
 *     tags: [SLA]
 *     summary: Create an SLA rule
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, priority, hours]
 *             properties:
 *               name: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               category: { type: string, nullable: true }
 *               departmentId: { type: string, nullable: true }
 *               hours: { type: number }
 *               active: { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: SLA rule created
 *
 * /sla/{id}:
 *   get:
 *     tags: [SLA]
 *     summary: Get a single SLA rule
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: SLA rule fetched
 *       404:
 *         description: SLA rule not found
 *   patch:
 *     tags: [SLA]
 *     summary: Update an SLA rule
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
 *               name: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               category: { type: string, nullable: true }
 *               departmentId: { type: string, nullable: true }
 *               hours: { type: number }
 *               active: { type: boolean }
 *     responses:
 *       200:
 *         description: SLA rule updated
 *       404:
 *         description: SLA rule not found
 */
exports.slaSwagger = { tag: "SLA" };
exports.default = exports.slaSwagger;
//# sourceMappingURL=swagger.js.map