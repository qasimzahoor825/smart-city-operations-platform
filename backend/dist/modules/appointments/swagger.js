"use strict";
/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Citizen appointment booking & status workflow
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentSwagger = void 0;
/**
 * @swagger
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: List appointments (filter by citizenId, departmentId, status, search)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: citizenId, in: query, schema: { type: string } }
 *       - { name: departmentId, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string, enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED] } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of appointments
 *   post:
 *     tags: [Appointments]
 *     summary: Book a new appointment for the authenticated citizen
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, scheduledAt]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *               departmentId: { type: string }
 *               durationMinutes: { type: integer }
 *     responses:
 *       201:
 *         description: Appointment booked
 *
 * /appointments/stats:
 *   get:
 *     tags: [Appointments]
 *     summary: Appointment statistics (byStatus counts)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregated appointment statistics
 *
 * /appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get a single appointment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Appointment fetched
 *   delete:
 *     tags: [Appointments]
 *     summary: Delete an appointment (owner or staff)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Appointment deleted
 *
 * /appointments/{id}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Transition an appointment status (PENDING -> CONFIRMED -> COMPLETED/CANCELLED, staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED] }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Appointment status updated
 */
exports.appointmentSwagger = { tag: "Appointments" };
exports.default = exports.appointmentSwagger;
//# sourceMappingURL=swagger.js.map