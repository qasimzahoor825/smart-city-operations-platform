"use strict";
/**
 * @swagger
 * tags:
 *   name: Emergencies
 *   description: Emergency response center (report, dispatch, monitor)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencySwagger = void 0;
/**
 * @swagger
 * /emergencies:
 *   get:
 *     tags: [Emergencies]
 *     summary: List emergencies (filter by status, type, severity, search)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: status, in: query, schema: { type: string, enum: [REPORTED, DISPATCHED, ON_SCENE, RESOLVED] } }
 *       - { name: type, in: query, schema: { type: string, enum: [FIRE, MEDICAL, FLOOD, ACCIDENT, PUBLIC_ALERT] } }
 *       - { name: severity, in: query, schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of emergencies
 *   post:
 *     tags: [Emergencies]
 *     summary: Report a new emergency
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, description]
 *             properties:
 *               type: { type: string, enum: [FIRE, MEDICAL, FLOOD, ACCIDENT, PUBLIC_ALERT] }
 *               title: { type: string }
 *               description: { type: string }
 *               severity: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: Emergency reported
 *
 * /emergencies/stats:
 *   get:
 *     tags: [Emergencies]
 *     summary: Emergency statistics (total/active/byStatus/byType)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregated emergency statistics
 *
 * /emergencies/{id}:
 *   get:
 *     tags: [Emergencies]
 *     summary: Get a single emergency
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Emergency fetched
 *
 * /emergencies/{id}/dispatch:
 *   patch:
 *     tags: [Emergencies]
 *     summary: Dispatch response units (staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [REPORTED, DISPATCHED, ON_SCENE, RESOLVED] }
 *               note: { type: string }
 *               unit: { type: string }
 *     responses:
 *       200:
 *         description: Emergency dispatched
 */
exports.emergencySwagger = { tag: "Emergencies" };
exports.default = exports.emergencySwagger;
//# sourceMappingURL=swagger.js.map