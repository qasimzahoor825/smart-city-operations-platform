"use client";

import React from "react";
import { Plus, Clock, MapPin, X } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Badge } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { appointmentsApi } from "@/services/operations";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import type { Appointment, AppointmentStatus } from "@/types";

const STATUS_STYLE: Record<AppointmentStatus, "info" | "success" | "warning" | "destructive"> = {
  PENDING: "info",
  CONFIRMED: "success",
  COMPLETED: "info",
  CANCELLED: "destructive",
};

export default function CitizenAppointmentsPage() {
  const { user } = useAuth();
  const [list, setList] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    appointmentsApi
      .list(user?.id)
      .then(setList)
      .catch(() => toast.error("Could not load appointments"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PageContainer title="Municipal Appointments" description="Book and manage appointments across city departments.">
      <div className="flex justify-end">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm((s) => !s)}>
          Book Appointment
        </Button>
      </div>

      {showForm && (
        <BookAppointmentForm
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
          <CardTitle>Appointments</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${list.length} appointment(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400 py-6">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {list.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div>
                    <div className="font-semibold text-white">{a.title}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(a.scheduledAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {a.department}
                      </span>
                    </div>
                  </div>
                  <Badge variant={STATUS_STYLE[a.status]}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function BookAppointmentForm({
  userId,
  onDone,
  onCancel,
}: {
  userId?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState("Public Works");
  const [when, setWhen] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!title.trim() || !when) {
      toast.error("Title and a date/time are required");
      return;
    }
    setBusy(true);
    try {
      await appointmentsApi.create({
        title: title.trim(),
        department,
        scheduledAt: new Date(when).toISOString(),
        citizenId: userId || null,
        citizenName: undefined,
      });
      toast.success("Appointment booked");
      onDone();
    } catch {
      toast.error("Could not book appointment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Book an Appointment</CardTitle>
          <CardDescription>Choose a department and time slot.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ap-title">Purpose</Label>
          <Input id="ap-title" placeholder="e.g. Property tax enquiry" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ap-dept">Department</Label>
          <select
            id="ap-dept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
          >
            {["Public Works", "Water & Sewage", "Power & Lighting", "Sanitation", "Parks & Recreation"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="appt-when">Date & Time</Label>
          <Input id="appt-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={busy} onClick={() => void submit()}>
            Confirm Booking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}