/**
 * @swagger
 * tags:
 *   name: Citizens
 *   description: Citizen profiles and participation statistics
 */

/**
 * @swagger
 * /citizens:
 *   get:
 *     tags: [Citizens]
 *     summary: List citizens (officers, heads and admins)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: ward, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Citizens fetched
 *
 * /citizens/stats:
 *   get:
 *     tags: [Citizens]
 *     summary: Platform-wide citizen overview
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Citizen overview fetched
 *
 * /citizens/{id}:
 *   get:
 *     tags: [Citizens]
 *     summary: Get a citizen profile
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Citizen fetched
 *       404:
 *         description: Citizen not found
 *   patch:
 *     tags: [Citizens]
 *     summary: Update a citizen profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               phoneNumber: { type: string }
 *               ward: { type: string }
 *               district: { type: string }
 *               avatar: { type: string }
 *     responses:
 *       200:
 *         description: Citizen profile updated
 *
 * /citizens/{id}/stats:
 *   get:
 *     tags: [Citizens]
 *     summary: Get a citizen's participation statistics
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Citizen statistics fetched
 */
export const citizensSwagger = { tag: "Citizens" };
export default citizensSwagger;