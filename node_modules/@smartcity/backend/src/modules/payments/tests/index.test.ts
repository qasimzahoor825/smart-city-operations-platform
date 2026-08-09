import { paymentService } from "../service";
import { paymentRepository } from "../repository";
import { ValidationError } from "@smartcity/common";

describe("paymentService", () => {
  beforeEach(() => {
    paymentRepository.reset();
  });

  it("lists bills and filters by status", async () => {
    const result = await paymentService.listBills({ status: "PENDING" });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((b) => b.status === "PENDING")).toBe(true);
  });

  it("filters bills by userId", async () => {
    const result = await paymentService.listBills({ userId: "usr_seed_citizen2" });
    expect(result.items.every((b) => b.userId === "usr_seed_citizen2")).toBe(true);
  });

  it("rejects an invalid bill status filter", async () => {
    await expect(paymentService.listBills({ status: "BOGUS" })).rejects.toThrow("Invalid status");
  });

  it("pays a bill and creates a transaction with a TXN ref", async () => {
    const result = await paymentService.pay({ billId: "bil_seed_001", method: "card" });
    expect(result.transaction.transactionRef.startsWith("TXN-")).toBe(true);
    expect(result.transaction.status).toBe("SUCCESS");
    expect(result.bill.status).toBe("PAID");
    expect(result.bill.paidAt).toBeTruthy();
  });

  it("rejects paying an already-paid bill", async () => {
    await expect(paymentService.pay({ billId: "bil_seed_002" })).rejects.toThrow("already been paid");
  });

  it("rejects paying an unknown bill", async () => {
    await expect(paymentService.pay({ billId: "bil_missing" })).rejects.toThrow("Bill not found");
  });

  it("lists transactions sorted newest first", async () => {
    const result = await paymentService.listTransactions({});
    expect(result.items.length).toBeGreaterThan(0);
    const times = result.items.map((t) => new Date(t.createdAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("aggregates a payment summary", async () => {
    const summary = await paymentService.summary();
    expect(summary.totalBills).toBe(5);
    expect(summary.paid).toBe(2);
    expect(summary.pending).toBe(2);
    expect(summary.overdue).toBe(1);
    expect(summary.transactionCount).toBe(2);
    expect(summary.totalCollected).toBeGreaterThan(0);
  });
});