/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role definitions and permission claims
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List all roles with their permissions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Roles fetched
 *
 * /roles/{role}:
 *   get:
 *     tags: [Roles]
 *     summary: Describe a single role
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: role, in: path, required: true, schema: { type: string, enum: [CITIZEN, OFFICER, DEPARTMENT_HEAD, SUPER_ADMIN] } }
 *     responses:
 *       200:
 *         description: Role fetched
 *       404:
 *         description: Role not found
 */
export const rolesSwagger = { tag: "Roles" };
export default rolesSwagger;