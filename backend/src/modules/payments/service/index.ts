import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
  generateRef,
  paginate,
  type Pagination,
} from "@smartcity/common";
import {
  paymentRepository,
  type BillStatus,
  type StoredBill,
  type StoredTransaction,
} from "../repository";
import type {
  BillQuery,
  PayBillDto,
  PayBillResult,
  PaymentSummary,
  TransactionQuery,
} from "../dto";

const BILL_STATUSES: BillStatus[] = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
const PAYMENT_METHODS = ["card", "bank_transfer", "wallet", "cash"];

export const paymentService = {
  /**
   * Seed a small set of realistic bills for any user that currently has none, so
   * the payments page always has data to show regardless of which account logs in.
   */
  ensureDemoBills(userId: string, userName: string): void {
    const existing = paymentRepository.bills.query({ filter: (b) => b.userId === userId });
    if (existing.length > 0) return;

    const now = new Date().toISOString();
    const specs: { billType: string; description: string; amount: number; status: BillStatus; dueInDays: number }[] = [
      { billType: "WATER", description: "Water & sanitation utilities", amount: 98.5, status: "PENDING", dueInDays: 5 },
      { billType: "TAX", description: "Property tax — annual cycle", amount: 320.0, status: "PAID", dueInDays: -10 },
      { billType: "SERVICE_FEE", description: "Service request processing fee", amount: 74.25, status: "OVERDUE", dueInDays: -2 },
    ];

    specs.forEach((spec) => {
      const bill = paymentRepository.bills.create({
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
      } as StoredBill);

      if (spec.status === "PAID") {
        paymentRepository.transactions.create({
          transactionRef: generateRef("TXN"),
          billId: bill.id,
          userId,
          userName,
          amount: spec.amount,
          currency: "USD",
          status: "SUCCESS",
          method: "card",
          paidAt: now,
          createdAt: now,
        } as unknown as StoredTransaction);
      }
    });
  },

  async listBills(query: BillQuery = {}): Promise<{ items: StoredBill[]; pagination: Pagination }> {
    if (query.userId) this.ensureDemoBills(query.userId, query.userName ?? "Citizen");
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    if (query.status !== undefined && !(BILL_STATUSES as string[]).includes(query.status)) {
      throw new AppError(`Invalid status. Allowed: ${BILL_STATUSES.join(", ")}`, 422);
    }
    const items = paymentRepository.bills.query({
      filter: (b) =>
        (query.userId === undefined || b.userId === query.userId) &&
        (query.status === undefined || b.status === query.status),
      sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async getBill(id: string): Promise<StoredBill> {
    const bill = paymentRepository.bills.findById(id);
    if (!bill) throw new NotFoundError("Bill not found");
    return bill;
  },

  async pay(dto: PayBillDto): Promise<PayBillResult> {
    const billId = (dto.billId ?? "").trim();
    if (!billId) throw new ValidationError({ billId: "billId is required" });
    const bill = paymentRepository.bills.findById(billId);
    if (!bill) throw new NotFoundError("Bill not found");
    if (bill.status === "PAID") throw new ConflictError("This bill has already been paid");
    if (bill.status === "CANCELLED") throw new ConflictError("This bill has been cancelled");

    const method = (dto.method ?? "card").trim().toLowerCase();
    if (!(PAYMENT_METHODS as string[]).includes(method)) {
      throw new ValidationError({ method: `Invalid method. Allowed: ${PAYMENT_METHODS.join(", ")}` });
    }

    const now = new Date().toISOString();
    const transaction = paymentRepository.transactions.create({
      transactionRef: generateRef("TXN"),
      billId: bill.id,
      userId: bill.userId,
      userName: bill.userName,
      amount: bill.amount,
      currency: bill.currency,
      status: "SUCCESS",
      method,
      paidAt: now,
      createdAt: now,
    } as unknown as StoredTransaction);

    const updatedBill = paymentRepository.bills.update(bill.id, {
      status: "PAID",
      paidAt: now,
    } as Partial<StoredBill>);
    if (!updatedBill) throw new NotFoundError("Bill not found");

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

  async listTransactions(query: TransactionQuery = {}): Promise<{ items: StoredTransaction[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const items = paymentRepository.transactions.query({
      filter: (t) => query.userId === undefined || t.userId === query.userId,
      sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async summary(): Promise<PaymentSummary> {
    const bills = paymentRepository.bills.all();
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
      transactionCount: paymentRepository.transactions.count(),
      generatedAt: new Date().toISOString(),
    };
  },
};

export default paymentService;