"use client";

import React from "react";
import { CheckCircle2, Receipt, ArrowUpRight } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { paymentsApi } from "@/services/payments";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import type { Bill, PaymentTransaction } from "@/types";

export default function CitizenPaymentsPage() {
  const { user } = useAuth();
  const [bills, setBills] = React.useState<Bill[]>([]);
  const [txns, setTxns] = React.useState<PaymentTransaction[]>([]);
  const [summary, setSummary] = React.useState({ totalPaid: 0, count: 0, currency: "USD" });
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      paymentsApi.listBills(user?.id),
      paymentsApi.listTransactions(user?.id),
      paymentsApi.summary(user?.id).catch(() => ({ totalPaid: 0, count: 0, currency: "USD" })),
    ])
      .then(([b, t, s]) => {
        setBills(b);
        setTxns(t);
        setSummary(s);
      })
      .catch(() => toast.error("Could not load payment data"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const onPay = async (bill: Bill) => {
    try {
      await paymentsApi.pay({
        userId: user?.id || "anonymous",
        billType: bill.billType,
        amount: bill.amount,
        currency: bill.currency,
        description: bill.description,
      });
      toast.success(`${bill.description || bill.billType} paid`);
      refresh();
    } catch {
      toast.error("Payment failed");
    }
  };

  return (
    <PageContainer title="Payments & Bills" description="View and settle city service charges.">
      <div className="grid md:grid-cols-3 gap-4">
        <Card glass>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
            <CardDescription>Pending bills</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-white">{bills.filter((b) => b.status === "PENDING").length}</p>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader>
            <CardTitle>Total Paid</CardTitle>
            <CardDescription>Life-time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-white">
              {summary.currency} {summary.totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Claims processed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-white">{txns.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle>Due Bills</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${bills.length} bills`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400 py-6">Loading…</p>
          ) : bills.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No bills.</p>
          ) : (
            <div className="space-y-3">
              {bills.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{b.description || b.billType}</div>
                      <div className="text-xs text-slate-400">
                        {b.billType} · Due {new Date(b.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">
                      {b.currency} {b.amount.toFixed(2)}
                    </span>
                    {b.status === "PAID" ? (
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </Badge>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => void onPay(b)} rightIcon={<ArrowUpRight className="w-3 h-3" />}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}