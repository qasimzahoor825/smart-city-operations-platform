"use strict";
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Administration of platform user accounts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersSwagger = void 0;
/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: role, in: query, schema: { type: string, enum: [CITIZEN, OFFICER, DEPARTMENT_HEAD, SUPER_ADMIN] } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: departmentId, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Users fetched
 *
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the current authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user fetched
 *
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a single user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: User fetched
 *       404:
 *         description: User not found
 *   patch:
 *     tags: [Users]
 *     summary: Update a user account
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [CITIZEN, OFFICER, DEPARTMENT_HEAD, SUPER_ADMIN] }
 *               departmentId: { type: string }
 *               isEmailVerified: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User deleted
 *
 * /users/{id}/activate:
 *   patch:
 *     tags: [Users]
 *     summary: Activate a user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User activated
 *
 * /users/{id}/deactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Deactivate a user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User deactivated
 */
exports.usersSwagger = { tag: "Users" };
exports.default = exports.usersSwagger;
//# sourceMappingURL=swagger.js.map