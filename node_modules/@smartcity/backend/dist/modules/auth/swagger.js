"use strict";
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & session management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSwagger = void 0;
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new citizen account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               role: { type: string, enum: [CITIZEN, OFFICER, DEPARTMENT_HEAD, SUPER_ADMIN] }
 *     responses:
 *       201:
 *         description: Account created
 *       409:
 *         description: Email already exists
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate and receive tokens
 *     responses:
 *       200:
 *         description: Authentication successful
 *
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile fetched
 */
exports.authSwagger = { tag: "Auth" };
exports.default = exports.authSwagger;
//# sourceMappingURL=swagger.js.map