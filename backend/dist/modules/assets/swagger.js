"use strict";
/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Physical and operational infrastructure assets & inspections
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetSwagger = void 0;
/**
 * @swagger
 * /assets:
 *   get:
 *     tags: [Assets]
 *     summary: List assets (filter by category / status / search)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: category, in: query, schema: { type: string, enum: [ROAD, WATER, ELECTRICITY, STREET_LIGHT, PARK, BUILDING, PUBLIC_TRANSPORT, SANITATION, OTHER] } }
 *       - { name: status, in: query, schema: { type: string, enum: [OPERATIONAL, UNDER_MAINTENANCE, OUT_OF_SERVICE] } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of assets
 *   post:
 *     tags: [Assets]
 *     summary: Register a new asset (staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department]
 *             properties:
 *               name: { type: string }
 *               category: { type: string, enum: [ROAD, WATER, ELECTRICITY, STREET_LIGHT, PARK, BUILDING, PUBLIC_TRANSPORT, SANITATION, OTHER] }
 *               status: { type: string, enum: [OPERATIONAL, UNDER_MAINTENANCE, OUT_OF_SERVICE] }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *               imageUrl: { type: string }
 *               department: { type: string }
 *               maintainedBy: { type: string }
 *     responses:
 *       201:
 *         description: Asset created
 *
 * /assets/stats:
 *   get:
 *     tags: [Assets]
 *     summary: Asset statistics (byStatus / byCategory)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregated asset statistics
 *
 * /assets/{id}:
 *   get:
 *     tags: [Assets]
 *     summary: Get a single asset
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Asset fetched
 *   delete:
 *     tags: [Assets]
 *     summary: Delete an asset (staff only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Asset deleted
 *
 * /assets/{id}/status:
 *   patch:
 *     tags: [Assets]
 *     summary: Update an asset's operational status (staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [OPERATIONAL, UNDER_MAINTENANCE, OUT_OF_SERVICE] }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Asset status updated
 *
 * /assets/{id}/inspections:
 *   get:
 *     tags: [Assets]
 *     summary: List inspections for an asset
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Inspections fetched
 *   post:
 *     tags: [Assets]
 *     summary: Record an inspection (staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, findings]
 *             properties:
 *               status: { type: string }
 *               findings: { type: string }
 *     responses:
 *       201:
 *         description: Inspection recorded
 *
 * /assets/{id}/inspections/latest:
 *   get:
 *     tags: [Assets]
 *     summary: Get the latest inspection for an asset
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Latest inspection
 */
exports.assetSwagger = { tag: "Assets" };
exports.default = exports.assetSwagger;
//# sourceMappingURL=swagger.js.map