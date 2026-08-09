"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsSwagger = void 0;
/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Billing, payments & transaction history
 *
 * @swagger
 * /bills:
 *   get:
 *     tags: [Payments]
 *     summary: List bills (filter by userId, status)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: userId, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string, enum: [PENDING, PAID, OVERDUE, CANCELLED] } }
 *     responses:
 *       200:
 *         description: Paginated list of bills
 *
 * /bills/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get a single bill
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Bill fetched
 *
 * /payments/pay:
 *   post:
 *     tags: [Payments]
 *     summary: Pay a bill (creates a transaction with a generated TXN reference)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [billId]
 *             properties:
 *               billId: { type: string }
 *               method: { type: string, enum: [card, bank_transfer, wallet, cash] }
 *     responses:
 *       201:
 *         description: Payment processed
 *
 * /payments/transactions:
 *   get:
 *     tags: [Payments]
 *     summary: List payment transactions (paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: userId, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of transactions
 *
 * /payments/summary:
 *   get:
 *     tags: [Payments]
 *     summary: Aggregated payment summary
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Payment summary
 */
exports.paymentsSwagger = { tag: "Payments" };
exports.default = exports.paymentsSwagger;
//# sourceMappingURL=swagger.js.map