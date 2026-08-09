"use strict";
/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Municipal departments, officer assignments and performance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentsSwagger = void 0;
/**
 * @swagger
 * /departments:
 *   get:
 *     tags: [Departments]
 *     summary: List departments
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Departments fetched
 *   post:
 *     tags: [Departments]
 *     summary: Create a department (admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Department created
 *       409:
 *         description: Name or code already in use
 *
 * /departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get a department
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Department fetched
 *       404:
 *         description: Department not found
 *   patch:
 *     tags: [Departments]
 *     summary: Update a department (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Department updated
 *   delete:
 *     tags: [Departments]
 *     summary: Delete a department (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Department deleted
 *
 * /departments/{id}/stats:
 *   get:
 *     tags: [Departments]
 *     summary: Get department statistics (officer and complaint counts)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Department statistics fetched
 *
 * /departments/{id}/officers:
 *   post:
 *     tags: [Departments]
 *     summary: Assign officers to a department (head or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [officerIds]
 *             properties:
 *               officerIds: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Officers assigned
 */
exports.departmentsSwagger = { tag: "Departments" };
exports.default = exports.departmentsSwagger;
//# sourceMappingURL=swagger.js.map