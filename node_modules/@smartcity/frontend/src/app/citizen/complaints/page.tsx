"use client";

import React from "react";
import { Plus, Search, MapPin, X, Filter } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
} from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import type { CreateComplaintPayload } from "@/services/complaints";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import type { Complaint, ComplaintStatus, ComplaintPriority } from "@/types";

const CATEGORIES = ["ROAD", "WATER", "ELECTRICITY", "GARBAGE", "PARKS", "STREET_LIGHT", "NOISE", "OTHER"];

const STATUS_STYLE: Record<ComplaintStatus, { label: string; variant: "success" | "warning" | "destructive" | "info" | "default" }> = {
  SUBMITTED: { label: "Submitted", variant: "info" },
  RECEIVED: { label: "Received", variant: "info" },
  ASSIGNED: { label: "Assigned", variant: "info" },
  UNDER_REVIEW: { label: "Under Review", variant: "info" },
  FIELD_INSPECTION: { label: "Field Inspection", variant: "warning" },
  IN_PROGRESS: { label: "In Progress", variant: "warning" },
  RESOLVED: { label: "Resolved", variant: "success" },
  CITIZEN_FEEDBACK: { label: "Awaiting Feedback", variant: "warning" },
  CLOSED: { label: "Closed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  ESCALATED: { label: "Escalated", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "default" },
};

const PRIORITY_STYLE: Record<ComplaintPriority, string> = {
  LOW: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CitizenComplaintsPage() {
  const { user } = useAuth();
  const [list, setList] = React.useState<Complaint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const refresh = React.useCallback(() => {
    setLoading(true);
    complaintsApi
      .list({ citizenId: user?.id, limit: 100, search: search || undefined, status: statusFilter || undefined })
      .then((res) => setList(res.data))
      .catch(() => toast.error("Could not load your complaints"))
      .finally(() => setLoading(false));
  }, [user?.id, search, statusFilter]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PageContainer
      title="Grievance & Incident Reports"
      description="Submit civil issues to municipal departments with real-time status resolution tracking."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm((s) => !s)}>
          Lodge New Grievance
        </Button>
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Search tickets by ID or keyword..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_STYLE).map((s) => (
              <option key={s} value={s}>
                {STATUS_STYLE[s as ComplaintStatus].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <NewComplaintForm
          userId={user?.id}
          onDone={() => {
            setShowForm(false);
            refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Card glass>
        <CardHeader>
          <CardTitle>Your Complaints</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${list.length} complaint(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400 py-6">Loading complaints…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No complaints yet. Lodge your first grievance above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-white/5 text-slate-400">
                  <tr>
                    <th className="p-4 rounded-l-xl">ID</th>
                    <th className="p-4">Title & Location</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 rounded-r-xl">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {list.map((c) => {
                    const st = STATUS_STYLE[c.status];
                    return (
                      <React.Fragment key={c.id}>
                        <tr
                          className="hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setExpanded((cur) => (cur === c.id ? null : c.id))}
                        >
                          <td className="p-4 font-mono text-blue-400">#{c.id.slice(-6).toUpperCase()}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{c.title}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {c.address || "Location provided"}
                            </div>
                          </td>
                          <td className="p-4">{c.category.replace("_", " ")}</td>
                          <td className="p-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${PRIORITY_STYLE[c.priority]}`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </td>
                          <td className="p-4 text-xs text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                        {expanded === c.id && (
                          <tr>
                            <td colSpan={6} className="p-4 bg-slate-900/40">
                              <div className="space-y-4">
                                <p className="text-slate-300">{c.description}</p>
                                {c.departmentName && (
                                  <p className="text-xs text-slate-400">
                                    Routed to <span className="text-slate-200 font-semibold">{c.departmentName}</span>
                                  </p>
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-slate-300 mb-2">Status Timeline</p>
                                  <ol className="space-y-2">
                                    {c.timeline.map((t, i) => (
                                      <li key={i} className="text-xs flex gap-2">
                                        <span className="text-blue-400">
                                          {STATUS_STYLE[t.status].label}
                                        </span>
                                        <span className="text-slate-500">
                                          {t.note}
                                        </span>
                                        <span className="text-slate-600 ml-auto">
                                          {new Date(t.createdAt).toLocaleString()}
                                        </span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                                {c.comments.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-300 mb-2">Comments</p>
                                    <ul className="space-y-1">
                                      {c.comments.map((cm) => (
                                        <li key={cm.id} className="text-xs text-slate-400">
                                          <span className="text-slate-200 font-semibold">{cm.author}:</span> {cm.body}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function NewComplaintForm({
  userId,
  onDone,
  onCancel,
}: {
  userId?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("ROAD");
  const [description, setDescription] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [priority, setPriority] = React.useState("MEDIUM");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        address: address.trim() || undefined,
        citizenId: userId || "anonymous",
      };
      await complaintsApi.create(payload as unknown as CreateComplaintPayload);
      toast.success("Complaint submitted and routed to the relevant department");
      onDone();
    } catch {
      toast.error("Could not submit complaint");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Lodge a Complaint</CardTitle>
          <CardDescription>Provide details so the right department can act quickly.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ct-title">Title</Label>
          <Input id="ct-title" placeholder="Brief summary of the issue" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ct-category">Category</Label>
            <select
              id="ct-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ct-priority">Priority</Label>
            <select
              id="ct-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
            >
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="ct-address">Location / Address</Label>
          <Input id="ct-address" placeholder="Street, area, or landmark" value={address} onChange={(e) => setAddress(e.target.value)} leftIcon={<MapPin className="w-4 h-4" />} />
        </div>
        <div>
          <Label htmlFor="ct-desc">Description</Label>
          <Textarea id="ct-desc" placeholder="Describe the problem in detail" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={busy} onClick={() => void submit()}>
            Submit Complaint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}