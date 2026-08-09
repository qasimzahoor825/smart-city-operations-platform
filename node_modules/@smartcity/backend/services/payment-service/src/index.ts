import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { AppError, generateRef, paginate } from "@smartcity/common";

interface Bill {
  id: string;
  billType: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID";
  description: string;
  dueDate: string;
  userId: string;
}
interface Transaction {
  id: string;
  billType: string;
  amount: number;
  currency: string;
  status: string;
  transactionRef: string;
  userId: string;
  description?: string;
  paidAt: string;
}

const bills: Bill[] = [
  { id: "bill-1", billType: "WATER", amount: 48.5, currency: "USD", status: "PAID", description: "Water consumption - June", dueDate: "2026-07-15", userId: "usr_seed_citizen1" },
  { id: "bill-2", billType: "POWER", amount: 132.75, currency: "USD", status: "PENDING", description: "Electricity — June", dueDate: "2026-08-10", userId: "usr_seed_citizen1" },
  { id: "bill-3", billType: "PROPERTY_TAX", amount: 640.0, currency: "USD", status: "PENDING", description: "Annual property tax 2026", dueDate: "2026-09-30", userId: "usr_seed_citizen2" },
];

const transactions: Transaction[] = [
  { id: "txn-1", billType: "WATER", amount: 48.5, currency: "USD", status: "COMPLETED", transactionRef: "TXN-A7F3K2", userId: "usr_seed_citizen1", description: "Water consumption — June", paidAt: "2026-07-14T09:12:00.000Z" },
];

const app = express();
const PORT = Number(process.env.PORT || 4003);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ service: "Payment Service", status: "UP", timestamp: new Date().toISOString() });
});

app.get("/bills", (req, res) => {
  const { userId, status } = req.query;
  let items = userId ? bills.filter((b) => b.userId === userId) : bills;
  if (status) items = items.filter((b) => b.status === status);
  res.json({ success: true, data: items, timestamp: new Date().toISOString() });
});

app.get("/transactions", (req, res) => {
  const { userId, page = 1, limit = 20 } = req.query;
  let items = userId ? transactions.filter((t) => t.userId === userId) : transactions;
  items = [...items].sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  const { items: slice, pagination } = paginate(items, Number(page), Number(limit));
  res.json({ success: true, data: slice, pagination, timestamp: new Date().toISOString() });
});

app.post("/pay", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, billType, amount, currency, description } = req.body ?? {};
    if (!userId || !amount) throw new AppError("userId and amount are required", 422);
    const ref = generateRef("TXN");
    const payment: Transaction = {
      id: "txn-" + Math.random().toString(36).slice(2, 10),
      billType,
      amount: Number(amount),
      currency: currency || "USD",
      status: "COMPLETED",
      transactionRef: ref,
      userId,
      description,
      paidAt: new Date().toISOString(),
    };
    transactions.unshift(payment);
    const idx = bills.findIndex((b) => b.userId === userId && b.billType === billType && b.status === "PENDING");
    if (idx >= 0) bills[idx].status = "PAID";
    res.status(201).json({ success: true, message: "Payment processed", data: payment, timestamp: new Date().toISOString() });
  } catch (e) { next(e); }
});

app.get("/payments/summary", (req, res) => {
  const userId = String(req.query.userId || "");
  const userTxns = userId ? transactions.filter((t) => t.userId === userId) : transactions;
  const totalPaid = userTxns.reduce((s, t) => s + t.amount, 0);
  res.json({ success: true, data: { totalPaid, count: userTxns.length, currency: "USD" }, timestamp: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`💳 Payment Service on port ${PORT}`);
});