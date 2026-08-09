/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: In-app notifications, channel dispatch & user preferences
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications (filter by userId, unread)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: userId, in: query, schema: { type: string } }
 *       - { name: unread, in: query, schema: { type: boolean } }
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 *
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Total unread notifications for the current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unread notification count
 *
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Notification marked as read
 *
 * /notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all of the current user's notifications as read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Count of notifications updated
 *
 * /notifications/send:
 *   post:
 *     tags: [Notifications]
 *     summary: Dispatch a notification to a user/channel via mock transport
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, message]
 *             properties:
 *               userId: { type: string }
 *               title: { type: string }
 *               message: { type: string }
 *               type: { type: string, enum: [IN_APP, EMAIL, PUSH, SMS, SYSTEM] }
 *               channel: { type: string }
 *     responses:
 *       201:
 *         description: Notification dispatched
 *
 * /notifications/preferences:
 *   get:
 *     tags: [Notifications]
 *     summary: Get the current user's notification preferences
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Preferences fetched
 *   put:
 *     tags: [Notifications]
 *     summary: Update email/push/sms toggles and subscribed categories
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: boolean }
 *               push: { type: boolean }
 *               sms: { type: boolean }
 *               categories: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Preferences updated
 */
export const notificationsSwagger = { tag: "Notifications" };
export default notificationsSwagger;