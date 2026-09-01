import { UserRole } from "@smartcity/common";
import { complaintRepository } from "../../complaints/repository";
import { paymentRepository } from "../../payments/repository";
import { emergencyRepository } from "../../emergency/repository";
import { notificationRepository } from "../../notifications/repository";
import { appointmentRepository } from "../../appointments/repository";
import { departmentRepository } from "../../departments/repository";
import { assetRepository } from "../../assets/repository";
import { authRepository } from "../../auth/repository";
import { iotService } from "../../iot/service";
import type { AuthenticatedUser } from "../../../middleware/auth";
import type { ChatDto } from "../dto";

const OPEN_STATUSES = ["SUBMITTED", "RECEIVED", "ASSIGNED", "UNDER_REVIEW", "FIELD_INSPECTION", "IN_PROGRESS", "ESCALATED"];
const RESOLVED_STATUSES = ["RESOLVED", "CITIZEN_FEEDBACK", "CLOSED"];
const INACTIVE_EMERGENCY = ["RESOLVED", "CLOSED"];

export type DataIntent =
  | "my_complaints"
  | "city_complaints"
  | "my_bills"
  | "emergencies"
  | "iot_status"
  | "appointments"
  | "notifications"
  | "city_overview"
  | "help"
  | "fallback";

interface IntentDef {
  id: DataIntent;
  keywords: string[];
}

const INTENT_DEFS: IntentDef[] = [
  {
    id: "my_complaints",
    keywords: ["my complaint", "my complaints", "track my complaint", "complaint status", "where is my complaint", "my issues"],
  },
  {
    id: "city_complaints",
    keywords: [
      "complaint",
      "complaints",
      "pothole",
      "garbage",
      "grievance",
      "streetlight",
      "issues reported",
      "how many complaints",
      "reported issues",
    ],
  },
  {
    id: "my_bills",
    keywords: ["bill", "bills", "payment", "pay", "dues", "tax", "invoice", "amount due", "i owe", "payable"],
  },
  {
    id: "emergencies",
    keywords: ["emergency", "emergencies", "fire", "flood", "ambulance", "medical", "rescue", "dispatch", "incident"],
  },
  {
    id: "iot_status",
    keywords: [
      "iot",
      "sensor",
      "air quality",
      "aqi",
      "water level",
      "traffic flow",
      "anomal",
      "telemetry",
      "sensor reading",
      "smart lighting",
      "energy",
    ],
  },
  {
    id: "appointments",
    keywords: ["appointment", "appointments", "booking", "book a", "schedule", "slot", "office visit"],
  },
  {
    id: "notifications",
    keywords: ["notification", "notifications", "alerts", "unread", "reminder", "messages"],
  },
  {
    id: "city_overview",
    keywords: [
      "overview",
      "statistics",
      "stats",
      "dashboard",
      "how is the city",
      "citizens",
      "assets",
      "departments",
      "resolution rate",
      "performance",
      "summary",
    ],
  },
  {
    id: "help",
    keywords: ["hello", "hi", "hey", "salam", "assalam", "help", "what can you do", "who are you", "assist"],
  },
];

function resolveIntent(message: string): DataIntent {
  const text = message.toLowerCase();
  let best: DataIntent = "fallback";
  let bestScore = 0;
  for (const def of INTENT_DEFS) {
    let score = 0;
    for (const keyword of def.keywords) {
      if (text.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = def.id;
    }
  }
  return best;
}

interface MyData {
  complaints: unknown[];
  openComplaints: number;
  resolvedComplaints: number;
  recentComplaints: { ref: string; title: string; status: string; createdAt: string }[];
  bills: unknown[];
  pendingBills: unknown[];
  overdueBills: unknown[];
  pendingAmount: number;
  appointments: unknown[];
  upcomingAppointments: unknown[];
  notifications: unknown[];
  unreadCount: number;
}

interface DataContext {
  my: MyData | null;
  city: {
    totalComplaints: number;
    openComplaints: number;
    resolvedComplaints: number;
    resolutionRate: number;
    slaViolations: number;
    topCategories: { key: string; count: number }[];
    activeEmergencies: { type: string; title: string; status: string }[];
    totalEmergencies: number;
    departments: number;
    totalAssets: number;
    citizens: number;
    iotAnomalies: number;
    iotCritical: number;
    activeSensors: number;
    latestAnomaly: { sensorName: string; metricValue: number; unit: string; zScore: number; severity: string } | null;
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function buildContext(user: AuthenticatedUser | undefined): DataContext {
  const complaints = complaintRepository.complaints.all();
  const bills = paymentRepository.bills.all();
  const emergencies = emergencyRepository.emergencies.all();
  const notifications = notificationRepository.notifications.all();
  const appointments = appointmentRepository.appointments.all();
  const departments = departmentRepository.departments.all();
  const assets = assetRepository.assets.all();
  const users = authRepository.users.all();
  const anomalyOverview = iotService.anomalyOverview();
  const live = iotService.live();

  const categoryCount = new Map<string, number>();
  for (const complaint of complaints) {
    categoryCount.set(complaint.category, (categoryCount.get(complaint.category) ?? 0) + 1);
  }
  const topCategories = [...categoryCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count]) => ({ key, count }));

  const activeEmergencies = emergencies
    .filter((e) => !INACTIVE_EMERGENCY.includes(e.status))
    .map((e) => ({ type: e.type, title: e.title, status: e.status }));

  const my: MyData | null = user
    ? (() => {
        const isCitizen = user.role === UserRole.CITIZEN;
        const scopeComplaints = isCitizen
          ? complaints.filter((c) => c.citizenId === user.id)
          : complaints.filter((c) => c.departmentId === user.departmentId || c.assignedToId === user.id);
        const myBills = bills.filter((b) => b.userId === user.id);
        const myNotifications = notifications.filter((n) => n.userId === user.id || n.userId === null);
        const myAppointments = appointments.filter((a) => a.citizenId === user.id);
        const now = Date.now();
        return {
          complaints: scopeComplaints,
          openComplaints: scopeComplaints.filter((c) => OPEN_STATUSES.includes(c.status)).length,
          resolvedComplaints: scopeComplaints.filter((c) => RESOLVED_STATUSES.includes(c.status)).length,
          recentComplaints: [...scopeComplaints]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 3)
            .map((c) => ({ ref: c.ref, title: c.title, status: c.status, createdAt: c.createdAt })),
          bills: myBills,
          pendingBills: myBills.filter((b) => b.status === "PENDING"),
          overdueBills: myBills.filter((b) => b.status === "OVERDUE"),
          pendingAmount: myBills.filter((b) => b.status === "PENDING" || b.status === "OVERDUE").reduce((sum, b) => sum + b.amount, 0),
          appointments: myAppointments,
          upcomingAppointments: myAppointments.filter((a) => a.status === "PENDING" && new Date(a.scheduledAt).getTime() >= now),
          notifications: myNotifications,
          unreadCount: myNotifications.filter((n) => !n.isRead).length,
        };
      })()
    : null;

  const total = complaints.length;
  const resolved = complaints.filter((c) => RESOLVED_STATUSES.includes(c.status)).length;

  return {
    my,
    city: {
      totalComplaints: total,
      openComplaints: complaints.filter((c) => OPEN_STATUSES.includes(c.status)).length,
      resolvedComplaints: resolved,
      resolutionRate: total === 0 ? 0 : round1((resolved / total) * 100),
      slaViolations: complaints.filter((c) => c.slaBreached).length,
      topCategories,
      activeEmergencies,
      totalEmergencies: emergencies.length,
      departments: departments.length,
      totalAssets: assets.length,
      citizens: users.filter((u) => u.role === UserRole.CITIZEN).length,
      iotAnomalies: anomalyOverview.total,
      iotCritical: anomalyOverview.critical,
      activeSensors: live.length,
      latestAnomaly: anomalyOverview.latest[0]
        ? {
            sensorName: anomalyOverview.latest[0].sensorName,
            metricValue: anomalyOverview.latest[0].metricValue,
            unit: anomalyOverview.latest[0].unit,
            zScore: anomalyOverview.latest[0].zScore,
            severity: anomalyOverview.latest[0].severity,
          }
        : null,
    },
  };
}

function formatComplaintList(ctx: DataContext): string {
  if (!ctx.my || ctx.my.complaints.length === 0) {
    return "No complaints are registered under your account. File one from your dashboard and I'll help you track it.";
  }
  const my = ctx.my;
  const recent = my.recentComplaints
    .map((c) => `• ${c.ref} — ${c.title} (${c.status})`)
    .join("\n");
  return [
    `You have ${my.complaints.length} complaint(s) registered: ${my.openComplaints} open/in progress, ${my.resolvedComplaints} resolved.`,
    recent,
  ].join("\n");
}

function formatBills(ctx: DataContext): string {
  if (!ctx.my) return "Sign in to see your bills.";
  const dueAmount = ctx.my.pendingAmount;
  const pending = ctx.my.pendingBills.length;
  const overdue = ctx.my.overdueBills.length;
  if (pending === 0 && overdue === 0) {
    return "You have no pending bills — everything is paid up. Well done!";
  }
  return `You have ${pending} pending bill(s)${overdue > 0 ? ` and ${overdue} overdue` : ""} with a total of ${money(dueAmount)} due. Pay them from the Bills section of your dashboard.`;
}

function formatEmergencies(ctx: DataContext): string {
  const active = ctx.city.activeEmergencies;
  if (active.length === 0) return "No active emergencies right now — the city is calm.";
  const list = active.map((e) => `• ${e.title} (${e.status}, ${e.type})`).join("\n");
  return `There ${active.length === 1 ? "is 1 active emergency" : `are ${active.length} active emergencies`}:\n${list}`;
}

function formatIot(ctx: DataContext): string {
  const anomaly = ctx.city.latestAnomaly;
  const lines = [
    `IoT network: ${ctx.city.activeSensors} sensors streaming live.`,
    `Anomalies detected: ${ctx.city.iotAnomalies} total, ${ctx.city.iotCritical} critical.`,
  ];
  if (anomaly) {
    lines.push(`Latest alert: ${anomaly.sensorName} at ${anomaly.metricValue}${anomaly.unit} (${anomaly.zScore}σ, ${anomaly.severity}).`);
  }
  return lines.join("\n");
}

function formatAppointments(ctx: DataContext): string {
  if (!ctx.my) return "Sign in to see your appointments.";
  if (ctx.my.upcomingAppointments.length === 0) return "You have no upcoming appointments booked.";
  const next = ctx.my.upcomingAppointments[0] as unknown as { title: string; scheduledAt: string };
  return `You have ${ctx.my.upcomingAppointments.length} upcoming appointment(s). Next: ${next.title} on ${new Date(next.scheduledAt).toLocaleString()}.`;
}

function formatNotifications(ctx: DataContext): string {
  if (!ctx.my) return "Sign in to check your notifications.";
  const unread = ctx.my.notifications.filter((n) => !(n as unknown as { isRead: boolean }).isRead);
  const recent = unread
    .slice(0, 3)
    .map((n) => `• ${(n as unknown as { title: string }).title}`)
    .join("\n");
  return `You have ${unread.length} unread notification(s).\n${recent}`;
}

function formatCityOverview(ctx: DataContext): string {
  const c = ctx.city;
  return [
    `City overview — ${c.citizens} citizens, ${c.departments} departments, ${c.totalAssets} public assets.`,
    `Complaints: ${c.totalComplaints} total, ${c.openComplaints} open, ${c.resolvedComplaints} resolved (${c.resolutionRate}% resolution rate).`,
    `Top complaint categories: ${c.topCategories.map((t) => `${t.key} (${t.count})`).join(", ") || "none yet"}.`,
    `Emergencies: ${c.activeEmergencies.length} active of ${c.totalEmergencies}.`,
    `IoT: ${c.activeSensors} sensors live, ${c.iotAnomalies} anomalies (${c.iotCritical} critical).`,
  ].join("\n");
}

function formatIntentAnswer(intent: DataIntent, ctx: DataContext): string {
  switch (intent) {
    case "my_complaints":
      return formatComplaintList(ctx);
    case "city_complaints":
      return formatCityOverview(ctx).split("\n").slice(1, 3).join("\n");
    case "my_bills":
      return formatBills(ctx);
    case "emergencies":
      return formatEmergencies(ctx);
    case "iot_status":
      return formatIot(ctx);
    case "appointments":
      return formatAppointments(ctx);
    case "notifications":
      return formatNotifications(ctx);
    case "city_overview":
      return formatCityOverview(ctx);
    case "help":
      return `Assalam-o-Alaikum! I'm SmartCity Assist. Right now the city has ${ctx.city.openComplaints} open complaints and ${ctx.city.activeEmergencies.length} active emergencies. Ask me about your complaints, bills, appointments, notifications, emergencies, IoT sensor health or city-wide stats — I answer from live data.`;
    default:
      return `I can pull live data on complaints, bills, appointments, notifications, emergencies, IoT sensors and city statistics. Try "How many complaints are open?" or "Show my pending bills".`;
  }
}

const INTENT_SUGGESTIONS: Record<DataIntent, string[]> = {
  my_complaints: ["Track my complaint status", "File a new complaint"],
  city_complaints: ["How many complaints are open?", "Top complaint categories"],
  my_bills: ["Show my pending bills", "Pay a bill"],
  emergencies: ["Any active emergencies?", "Emergency help"],
  iot_status: ["Sensor anomaly summary", "Air quality readings"],
  appointments: ["Upcoming appointments", "Book an appointment"],
  notifications: ["Unread notifications", "Manage notification preferences"],
  city_overview: ["City performance summary", "Resolution rate"],
  help: ["How do I file a complaint?", "Show my pending bills", "City overview"],
  fallback: ["City overview", "Show my pending bills", "Any active emergencies?"],
};

export interface DataAnswer {
  reply: string;
  intent: DataIntent;
  suggestions: string[];
  dataBrief: string;
}

export function answerWithData(dto: ChatDto, user: AuthenticatedUser | undefined): DataAnswer {
  const intent = resolveIntent(dto.message);
  const ctx = buildContext(user);

  const dataBrief = [
    `Intent: ${intent}`,
    `City stats: ${ctx.city.totalComplaints} total complaints (${ctx.city.openComplaints} open, ${ctx.city.resolvedComplaints} resolved, ${ctx.city.resolutionRate}% resolution rate), ${ctx.city.slaViolations} SLA breaches, ${ctx.city.departments} departments, ${ctx.city.totalAssets} assets, ${ctx.city.citizens} citizens, ${ctx.city.activeEmergencies.length} active emergencies.`,
    `IoT: ${ctx.city.activeSensors} sensors live, ${ctx.city.iotAnomalies} anomalies (${ctx.city.iotCritical} critical)${ctx.city.latestAnomaly ? `, latest: ${ctx.city.latestAnomaly.sensorName} ${ctx.city.latestAnomaly.metricValue}${ctx.city.latestAnomaly.unit} at ${ctx.city.latestAnomaly.zScore}σ (${ctx.city.latestAnomaly.severity})` : ""}.`,
    ctx.my
      ? `User-specific: ${ctx.my.complaints.length} complaints (${ctx.my.openComplaints} open, ${ctx.my.resolvedComplaints} resolved), ${ctx.my.pendingBills.length} pending + ${ctx.my.overdueBills.length} overdue bills totalling ${money(ctx.my.pendingAmount)}, ${ctx.my.upcomingAppointments.length} upcoming appointments, ${ctx.my.unreadCount} unread notifications.`
      : "User-specific: none.",
  ].join("\n");

  const reply = formatIntentAnswer(intent, ctx);
  return {
    reply,
    intent,
    suggestions: INTENT_SUGGESTIONS[intent],
    dataBrief,
  };
}
