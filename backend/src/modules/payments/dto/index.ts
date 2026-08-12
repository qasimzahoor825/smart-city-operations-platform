import type { StoredBill, StoredTransaction } from "../repository";

export interface BillQuery {
  page?: number;
  limit?: number;
  userId?: string;
  userName?: string;
  status?: string;
}

export interface PayBillDto {
  billId: string;
  method?: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface PaymentSummary {
  totalBills: number;
  paid: number;
  pending: number;
  overdue: number;
  cancelled: number;
  totalBilled: number;
  totalCollected: number;
  transactionCount: number;
  generatedAt: string;
}

export interface PayBillResult {
  transaction: {
    id: string;
    transactionRef: string;
    billId: string;
    userId: string;
    userName: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    paidAt: string;
    createdAt: string;
  };
  bill: StoredBill;
}