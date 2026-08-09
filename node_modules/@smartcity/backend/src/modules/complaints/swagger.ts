/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Citizen complaint workflow, SLA tracking & assignment
 */

/**
 * @swagger
 * /complaints:
 *   get:
 *     tags: [Complaints]
 *     summary: List complaints (filter by status, priority, category, citizenId, search)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: status, in: query, schema: { type: string, enum: [SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REJECTED] } }
 *       - { name: priority, in: query, schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: citizenId, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of complaints
 *   post:
 *     tags: [Complaints]
 *     summary: Submit a new complaint
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *               imageUrls: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Complaint submitted
 *
 * /complaints/stats:
 *   get:
 *     tags: [Complaints]
 *     summary: Complaint statistics (total/open/resolved/byStatus/byPriority/byCategory)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregated complaint statistics
 *
 * /complaints/{id}:
 *   get:
 *     tags: [Complaints]
 *     summary: Get a single complaint
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Complaint fetched
 *   patch:
 *     tags: [Complaints]
 *     summary: Update a complaint (owner or staff)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Complaint updated
 *   delete:
 *     tags: [Complaints]
 *     summary: Delete a complaint (owner or staff)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Complaint deleted
 *
 * /complaints/{id}/assign:
 *   post:
 *     tags: [Complaints]
 *     summary: Assign a complaint to an officer (staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [officerId]
 *             properties:
 *               officerId: { type: string }
 *               departmentId: { type: string }
 *     responses:
 *       200:
 *         description: Complaint assigned
 *
 * /complaints/{id}/status:
 *   post:
 *     tags: [Complaints]
 *     summary: Transition a complaint status with SLA enforcement (staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REJECTED] }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Complaint status updated
 *
 * /complaints/{id}/comments:
 *   get:
 *     tags: [Complaints]
 *     summary: List comments on a complaint
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Comments fetched
 *   post:
 *     tags: [Complaints]
 *     summary: Add a comment to a complaint
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body: { type: string }
 *     responses:
 *       201:
 *         description: Comment added
 */
export const complaintSwagger = { tag: "Complaints" };
export default complaintSwagger;