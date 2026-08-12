import api from "@/services/api-client";
import type { ApiResponse, Bill, PaymentTransaction } from "@/types";

export const paymentsApi = {
  async listBills(userId?: string): Promise<Bill[]> {
    const { data } = await api.get<ApiResponse<Bill[]>>("/bills", { params: { userId } });
    return data.data ?? [];
  },
  async listTransactions(userId?: string): Promise<PaymentTransaction[]> {
    const { data } = await api.get<ApiResponse<PaymentTransaction[]>>("/transactions", { params: { userId } });
    return data.data ?? [];
  },
  async pay(payload: { billId: string; method?: string }): Promise<PaymentTransaction> {
    const { data } = await api.post<ApiResponse<PaymentTransaction>>("/pay", payload);
    return data.data as PaymentTransaction;
  },
  async summary(userId?: string): Promise<{ totalPaid: number; count: number; currency: string }> {
    const { data } = await api.get<ApiResponse<{ totalPaid: number; count: number; currency: string }>>("/payments/summary", { params: { userId } });
    return data.data as { totalPaid: number; count: number; currency: string };
  },
};