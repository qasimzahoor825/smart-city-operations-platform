export const TYPE_META: Record<string, { color: string; label: string }> = {
  complaint: { color: "#0d9488", label: "Complaint" },
  asset: { color: "#155e75", label: "Public Asset" },
  hospital: { color: "#4f46e5", label: "Health Facility" },
  police: { color: "#1e293b", label: "Police Station" },
  emergency: { color: "#dc2626", label: "Emergency" },
};

export const typeLabel = (type: string): string => TYPE_META[type]?.label ?? type;

export function priorityColor(priority?: string): string {
  const p = (priority ?? "").toUpperCase();
  if (p === "CRITICAL") return "#dc2626";
  if (p === "HIGH") return "#ea580c";
  if (p === "MEDIUM") return "#d97706";
  if (p === "LOW") return "#16a34a";
  return "#64748b";
}

export function statusColor(status?: string): string {
  const s = (status ?? "").toUpperCase();
  if (["OPEN", "OPERATIONAL", "ACTIVE", "RESOLVED", "CLOSED"].includes(s)) return "#16a34a";
  if (["IN_PROGRESS", "ASSIGNED", "DISPATCHED", "ON_SCENE", "FIELD_INSPECTION"].includes(s)) return "#0d9488";
  if (["SUBMITTED", "RECEIVED", "UNDER_REVIEW", "ACKNOWLEDGED", "MAINTENANCE"].includes(s)) return "#0284c7";
  if (["REJECTED", "CANCELLED"].includes(s)) return "#dc2626";
  return "#64748b";
}