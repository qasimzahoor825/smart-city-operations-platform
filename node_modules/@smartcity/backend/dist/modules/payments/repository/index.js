"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.seedTransactions = exports.seedBills = void 0;
const repository_1 = require("../../../core/database/repository");
const nowMs = Date.now();
const daysAgo = (d) => new Date(nowMs - d * 86_400_000).toISOString();
const daysFrom = (d) => new Date(nowMs + d * 86_400_000).toISOString();
exports.seedBills = [
    {
        id: "bil_seed_001",
        billRef: "BILL-24-PW-001",
        billType: "property_tax",
        description: "Annual property tax (Quota 2)",
        amount: 450.0,
        currency: "USD",
        status: "PENDING",
        userId: "usr_seed_citizen1",
        userName: "Sarah Jenkins",
        dueAt: daysFrom(5),
        paidAt: null,
        createdAt: daysAgo(12),
    },
    {
        id: "bil_seed_002",
        billRef: "BILL-24-WS-012",
        billType: "water",
        description: "Water & sanitation utilities",
        amount: 62.5,
        currency: "USD",
        status: "PAID",
        userId: "usr_seed_citizen1",
        userName: "Sarah Jenkins",
        dueAt: daysAgo(6),
        paidAt: daysAgo(3),
        createdAt: daysAgo(30),
    },
    {
        id: "bil_seed_003",
        billRef: "BILL-24-EL-007",
        billType: "electricity",
        description: "Electricity connection charges",
        amount: 120.0,
        currency: "USD",
        status: "OVERDUE",
        userId: "usr_seed_citizen1",
        userName: "Sarah Jenkins",
        dueAt: daysAgo(2),
        paidAt: null,
        createdAt: daysAgo(25),
    },
    {
        id: "bil_seed_004",
        billRef: "BILL-24-TF-023",
        billType: "traffic_fine",
        description: "Parking violation fine",
        amount: 35.0,
        currency: "USD",
        status: "PENDING",
        userId: "usr_seed_citizen2",
        userName: "James Carter",
        dueAt: daysFrom(10),
        paidAt: null,
        createdAt: daysAgo(4),
    },
    {
        id: "bil_seed_005",
        billRef: "BILL-24-PW-034",
        billType: "property_tax",
        description: "Property tax renewal",
        amount: 520.0,
        currency: "USD",
        status: "PAID",
        userId: "usr_seed_citizen2",
        userName: "James Carter",
        dueAt: daysAgo(15),
        paidAt: daysAgo(10),
        createdAt: daysAgo(40),
    },
];
exports.seedTransactions = [
    {
        id: "txn_seed_001",
        transactionRef: "TXN-24-7K9Q2A",
        billId: "bil_seed_002",
        userId: "usr_seed_citizen1",
        userName: "Sarah Jenkins",
        amount: 62.5,
        currency: "USD",
        status: "SUCCESS",
        method: "card",
        paidAt: daysAgo(3),
        createdAt: daysAgo(3),
    },
    {
        id: "txn_seed_002",
        transactionRef: "TXN-24-3H8P4M",
        billId: "bil_seed_005",
        userId: "usr_seed_citizen2",
        userName: "James Carter",
        amount: 520.0,
        currency: "USD",
        status: "SUCCESS",
        method: "bank_transfer",
        paidAt: daysAgo(10),
        createdAt: daysAgo(10),
    },
];
exports.paymentRepository = {
    bills: (0, repository_1.collection)("bills"),
    transactions: (0, repository_1.collection)("transactions"),
    reset() {
        this.bills.seed(exports.seedBills);
        this.transactions.seed(exports.seedTransactions);
    },
};
exports.default = exports.paymentRepository;
//# sourceMappingURL=index.js.map