"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
const BILL_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
const PAYMENT_METHODS = ["card", "bank_transfer", "wallet", "cash"];
exports.paymentService = {
    async listBills(query = {}) {
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