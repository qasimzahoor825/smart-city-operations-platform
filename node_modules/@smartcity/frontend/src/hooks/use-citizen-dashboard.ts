"use client";

import { useQuery } from "@tanstack/react-query";
import type { Appointment, AppNotification, Bill, Complaint } from "@/types";
import { complaintsApi } from "@/services/complaints";
import { paymentsApi } from "@/services/payments";
import { notificationsApi, appointmentsApi } from "@/services/operations";

/**
 * Fetches live data for the citizen dashboard. If an endpoint is unavailable
 * the list degrades to an empty state rather than inventing records — the UI
 * only ever renders data that came from the API.
 */
export function useCitizenDashboardData(userId?: string) {
  return useQuery({
    queryKey: ["citizen-dashboard", userId],
    queryFn: async () => {
      const [complaintsRes, billsRes, notificationsRes, appointmentsRes] = await Promise.allSettled([
        complaintsApi.list({ citizenId: userId, limit: 10 }),
        paymentsApi.listBills(userId),
        notificationsApi.list({ userId }),
        appointmentsApi.list(userId),
      ]);

      const complaints =
        complaintsRes.status === "fulfilled" ? complaintsRes.value.data : [] as Complaint[];
      const bills = billsRes.status === "fulfilled" ? billsRes.value : [] as Bill[];
      const notifications =
        notificationsRes.status === "fulfilled" ? notificationsRes.value : [] as AppNotification[];
      const appointments = appointmentsRes.status === "fulfilled" ? appointmentsRes.value : [] as Appointment[];

      const active = complaints.filter((c) =>
        ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"].includes(c.status),
      );
      const pendingBills = bills.filter((b) => b.status === "PENDING");
      const unread = notifications.filter((n) => !n.isRead);

      return {
        complaints,
        bills,
        notifications,
        appointments,
        activeCount: active.length,
        pendingBillsAmount: pendingBills.reduce((s, b) => s + b.amount, 0),
        pendingBillsCount: pendingBills.length,
        unreadCount: unread.length,
        appointmentCount: appointments.length,
      };
    },
    staleTime: 60_000,
  });
}