/**
 * @swagger
 * tags:
 *   - name: System
 *     description: Platform health, settings & runtime metrics
 *
 * @swagger
 * /system/health:
 *   get:
 *     tags: [System]
 *     summary: Service health (db ping flag, uptime, status)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: System health
 *
 * /system/settings:
 *   get:
 *     tags: [System]
 *     summary: Get platform settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Platform settings fetched
 *   put:
 *     tags: [System]
 *     summary: Update platform settings (SUPER_ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platformName: { type: string }
 *               maintenanceMode: { type: boolean }
 *               allowRegistrations: { type: boolean }
 *               allowPublicComplaints: { type: boolean }
 *               notificationsEnabled: { type: boolean }
 *     responses:
 *       200:
 *         description: Platform settings updated
 *
 * /system/metrics:
 *   get:
 *     tags: [System]
 *     summary: In-memory runtime counters (totalRequests, activeUsers, apiCalls)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: System metrics
 */
export const systemSwagger = { tag: "System" };
export default systemSwagger;