"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
const BILL_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
const PAYMENT_METHODS = ["card", "bank_transfer", "wallet", "cash"];
exports.paymentService = {
    /**
     * Seed a small set of realistic bills for any user that currently has none, so
     * the payments page always has data to show regardless of which account logs in.
     */
    ensureDemoBills(userId, userName) {
        const existing = repository_1.paymentRepository.bills.query({ filter: (b) => b.userId === userId });
        if (existing.length > 0)
            return;
        const now = new Date().toISOString();
        const specs = [
            { billType: "WATER", description: "Water & sanitation utilities", amount: 98.5, status: "PENDING", dueInDays: 5 },
            { billType: "TAX", description: "Property tax — annual cycle", amount: 320.0, status: "PAID", dueInDays: -10 },
            { billType: "SERVICE_FEE", description: "Service request processing fee", amount: 74.25, status: "OVERDUE", dueInDays: -2 },
        ];
        specs.forEach((spec) => {
            const bill = repository_1.paymentRepository.bills.create({
                billRef: `BILL-${new Date().getFullYear()}-DEMO-${Math.floor(100 + Math.random() * 900)}`,
                billType: spec.billType,
                description: spec.description,
                amount: spec.amount,
                currency: "USD",
                status: spec.status,
                userId,
                userName,
                dueAt: new Date(Date.now() + spec.dueInDays * 86_400_000).toISOString(),
                paidAt: spec.status === "PAID" ? now : null,
                createdAt: now,
            });
            if (spec.status === "PAID") {
                repository_1.paymentRepository.transactions.create({
                    transactionRef: (0, common_1.generateRef)("TXN"),
                    billId: bill.id,
                    userId,
                    userName,
                    amount: spec.amount,
                    currency: "USD",
                    status: "SUCCESS",
                    method: "card",
                    paidAt: now,
                    createdAt: now,
                });
            }
        });
    },
    async listBills(query = {}) {
        if (query.userId)
            this.ensureDemoBills(query.userId, query.userName ?? "Citizen");
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        if (query.status !== undefined && !BILL_STATUSES.includes(query.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${BILL_STATUSES.join(", ")}`, 422);
        }
        const items = repository_1.paymentRepository.bills.query({
            filter: (b) => (query.userId === undefined || b.userId === query.userId) &&
                (query.status === undefined || b.status === query.status),
            sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async getBill(id) {
        const bill = repository_1.paymentRepository.bills.findById(id);
        if (!bill)
            throw new common_1.NotFoundError("Bill not found");
        return bill;
    },
    async pay(dto) {
        const billId = (dto.billId ?? "").trim();
        if (!billId)
            throw new common_1.ValidationError({ billId: "billId is required" });
        const bill = repository_1.paymentRepository.bills.findById(billId);
        if (!bill)
            throw new common_1.NotFoundError("Bill not found");
        if (bill.status === "PAID")
            throw new common_1.ConflictError("This bill has already been paid");
        if (bill.status === "CANCELLED")
            throw new common_1.ConflictError("This bill has been cancelled");
        const method = (dto.method ?? "card").trim().toLowerCase();
        if (!PAYMENT_METHODS.includes(method)) {
            throw new common_1.ValidationError({ method: `Invalid method. Allowed: ${PAYMENT_METHODS.join(", ")}` });
        }
        const now = new Date().toISOString();
        const transaction = repository_1.paymentRepository.transactions.create({
            transactionRef: (0, common_1.generateRef)("TXN"),
            billId: bill.id,
            userId: bill.userId,
            userName: bill.userName,
            amount: bill.amount,
            currency: bill.currency,
            status: "SUCCESS",
            method,
            paidAt: now,
            createdAt: now,
        });
        const updatedBill = repository_1.paymentRepository.bills.update(bill.id, {
            status: "PAID",
            paidAt: now,
        });
        if (!updatedBill)
            throw new common_1.NotFoundError("Bill not found");
        return {
            transaction: {
                id: transaction.id,
                transactionRef: transaction.transactionRef,
                billId: transaction.billId,
                userId: transaction.userId,
                userName: transaction.userName,
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                method: transaction.method,
                paidAt: transaction.paidAt,
                createdAt: transaction.createdAt,
            },
            bill: updatedBill,
        };
    },
    async listTransactions(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const items = repository_1.paymentRepository.transactions.query({
            filter: (t) => query.userId === undefined || t.userId === query.userId,
            sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async summary() {
        const bills = repository_1.paymentRepository.bills.all();
        const paidBills = bills.filter((b) => b.status === "PAID");
        const totalCollected = paidBills.reduce((sum, b) => sum + b.amount, 0);
        return {
            totalBills: bills.length,
            paid: paidBills.length,
            pending: bills.filter((b) => b.status === "PENDING").length,
            overdue: bills.filter((b) => b.status === "OVERDUE").length,
            cancelled: bills.filter((b) => b.status === "CANCELLED").length,
            totalBilled: bills.reduce((sum, b) => sum + b.amount, 0),
            totalCollected: Math.round(totalCollected * 100) / 100,
            transactionCount: repository_1.paymentRepository.transactions.count(),
            generatedAt: new Date().toISOString(),
        };
    },
};
exports.default = exports.paymentService;
//# sourceMappingURL=index.js.map