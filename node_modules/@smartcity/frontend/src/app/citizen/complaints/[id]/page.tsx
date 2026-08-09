"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  Clock,
  MessageCircle,
  ThumbsUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { complaintsApi } from "@/services/complaints";
import type { Complaint } from "@/types";

interface ComplaintDetailsProps {
  params: Promise<{ id: string }>;
}

const STEP_ORDER = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
type StepState = "done" | "active" | "pending";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Submitted",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

export default function ComplaintDetailsPage({ params }: ComplaintDetailsProps) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [complaint, setComplaint] = React.useState<Complaint | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activePhoto, setActivePhoto] = React.useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);

  const load = React.useCallback(() => {
    if (!ticketId) return;
    setLoading(true);
    complaintsApi
      .get(ticketId)
      .then((c) => setComplaint(c))
      .catch(() => {
        toast.error("Could not load complaint details");
        setComplaint(null);
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const currentIdx = complaint ? STEP_ORDER.indexOf(complaint.status as (typeof STEP_ORDER)[number]) : -1;

  const timelineSteps =
    complaint == null
      ? []
      : [...STEP_ORDER].map((status, idx) => {
          const state: StepState =
            idx < currentIdx || (idx === currentIdx && status !== "IN_PROGRESS")
              ? "done"
              : idx === currentIdx
              ? "active"
              : "pending";
          return { label: STATUS_LABEL[status] ?? status, state };
        });

  const activityHistory =
    complaint?.timeline.map((entry) => ({
      date: entry.createdAt,
      status: STATUS_LABEL[entry.status] ?? entry.status,
      color: entry.status === "RESOLVED" || entry.status === "CLOSED" ? "bg-emerald-500" : "bg-blue-600",
      detail: entry.note ?? "",
    })) ?? [];

  const attachedPhotos = complaint?.imageUrls ?? [];
  const departmentName = complaint?.departmentName ?? "Pending routing";
  const officerName = (complaint as (Complaint & { assignedToName?: string | null }))?.assignedToName ?? "Unassigned";
  const contactEmail = complaint?.departmentName
    ? `${complaint.departmentName.toLowerCase().replace(/\W+/g, ".")}@city.gov`
    : "support@city.gov";

  const priorityColor =
    complaint?.priority === "LOW"
      ? "text-slate-500"
      : complaint?.priority === "MEDIUM"
      ? "text-amber-700"
      : complaint?.priority === "HIGH"
      ? "text-red-700"
      : "text-red-800";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-10 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Title matching Screenshot 05 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Complaint #{ticketId}
          </h1>
          <Link
            href="/citizen/dashboard"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center gap-3">
            <span className="animate-spin border-2 border-teal-200 border-t-teal-600 rounded-full w-8 h-8" />
            <p className="text-xs text-slate-500 font-semibold">Loading complaint details...</p>
          </div>
        ) : complaint == null ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Complaint not found</h2>
            <p className="text-xs text-slate-500">This complaint could not be located or you do not have access to it.</p>
            <Link
              href="/citizen/dashboard"
              className="px-4 py-2 rounded-lg smart-btn-teal text-xs font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
        {/* Overview Metadata Bar Strip matching Screenshot 05 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <span className="text-slate-400 text-xs font-medium block">Category</span>
            <span className="font-bold text-slate-900 text-base">{complaint.category.replace("_", " ")}</span>
          </div>

          <div>
            <span className="text-slate-400 text-xs font-medium block">Location</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {complaint.address || "Location provided"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-xs font-medium block">Submitted Date</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-xs font-medium block">Department</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {departmentName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-xs font-medium block">Priority</span>
            <span className={`font-bold text-sm ${priorityColor}`}>{complaint.priority}</span>
          </div>
        </div>

        {/* Horizontal Progress Timeline Bar Card matching Screenshot 05 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Complaint progress timeline
          </h2>

          <div className="relative pt-2 pb-4">
            {/* Timeline Horizontal Line */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />
            
            {/* Active Progress Bar Portion */}
            <div className="absolute top-1/2 left-4 w-3/5 h-1 bg-teal-600 -translate-y-1/2 z-0" />

            {/* Stepper Nodes */}
            <div className="relative z-10 flex items-center justify-between">
              {timelineSteps.map((step, idx) => {
                const isDone = step.state === "done";
                const isActive = step.state === "active";
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isDone
                          ? "bg-teal-700 text-white"
                          : isActive
                          ? "bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse"
                          : "bg-slate-200 text-slate-400 border border-slate-300"
                      }`}
                    >
                      {isDone ? (
                        <span className="text-xs">OK</span>
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isActive
                          ? "text-teal-700 font-bold"
                          : isDone
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Grid matching Screenshot 05 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Description & Metadata */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Description Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Complaint Description
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {complaint.description}
              </p>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  Attached Photos
                </span>
                {attachedPhotos.length === 0 ? (
                  <p className="text-xs text-slate-400">No photos attached</p>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    {attachedPhotos.map((url, idx) => (
                      <button
                        key={url + idx}
                        onClick={() => setActivePhoto(url)}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-teal-600 transition-colors shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Officer & Dates 2x2 Grid matching Screenshot 05 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-slate-400 block font-medium">Assigned Officer</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  {officerName}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-1">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {departmentName}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-slate-400 block font-medium">Submitted Date</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-slate-400 block font-medium">Estimated Resolution</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-teal-600" />
                  {complaint.slaDeadline
                    ? new Date(complaint.slaDeadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "SLA pending"}
                </span>
              </div>
            </div>

          </div>

          {/* Center Column: Location Map Card matching Screenshot 05 */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700">Location Map</h3>
            
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-amber-50">
              {/* Map Graphic Simulation */}
              <div className="absolute inset-0 bg-[#fef08a]/30">
                <svg className="w-full h-full stroke-slate-300" strokeWidth="2">
                  <line x1="0" y1="90" x2="400" y2="90" stroke="#fbbf24" strokeWidth="12" />
                  <line x1="160" y1="0" x2="160" y2="300" stroke="#cbd5e1" strokeWidth="6" />
                </svg>
              </div>

              {/* Pin Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="p-2 rounded-full bg-slate-900 text-white shadow-xl">
                  <MapPin className="w-5 h-5 fill-slate-900 text-white" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-white/90 text-[10px] font-bold text-slate-800 shadow border border-slate-200 max-w-[180px] truncate">
                  {complaint.address || complaint.category}
                </span>
              </div>

              <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-0.5 rounded text-[9px] text-slate-500">
                Live coordinates
              </div>
            </div>
          </div>

          {/* Right Column: Activity History & Actions matching Screenshot 05 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Activity History Vertical Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Activity History</h3>

              {activityHistory.length === 0 ? (
                <p className="text-xs text-slate-400">No activity recorded yet.</p>
              ) : (
                <div className="relative pl-4 space-y-4 border-l border-slate-200 text-xs">
                  {activityHistory.map((item, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${item.color} ring-4 ring-white`} />
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {new Date(item.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900">{item.status}</div>
                      <p className="text-[11px] text-slate-500 leading-tight">{item.detail || "-"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons matching Screenshot 05 */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setContactOpen(true);
                  toast.info(`Connecting to ${officerName} (${departmentName})`);
                }}
                className="w-full py-3 rounded-xl smart-btn-navy text-xs font-semibold shadow flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Department</span>
              </button>

              <button
                onClick={() => {
                  setFeedbackOpen(true);
                  toast.success("Feedback dialog opened");
                }}
                className="w-full py-3 rounded-xl smart-btn-teal text-xs font-semibold shadow flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Provide Feedback</span>
              </button>
            </div>

          </div>

        </div>
        </>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl p-2 overflow-hidden shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-white z-10 hover:bg-slate-800"
              aria-label="Close photo"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activePhoto} alt="Full resolution view" className="w-full h-auto rounded-xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Provide Resolution Feedback</h3>
              <button onClick={() => setFeedbackOpen(false)} aria-label="Close dialog"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <textarea
              rows={3}
              placeholder="Leave feedback on officer response time..."
              className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setFeedbackOpen(false)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300">Cancel</button>
              <button
                onClick={() => {
                  setFeedbackOpen(false);
                  toast.success("Feedback submitted!");
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold smart-btn-teal"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Dialog */}
      {contactOpen && complaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Contact {departmentName}</h3>
              <button onClick={() => setContactOpen(false)} aria-label="Close dialog"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p><strong>Department:</strong> {departmentName}</p>
              <p><strong>Officer:</strong> {officerName}</p>
              <p><strong>Email:</strong> {contactEmail}</p>
              <p><strong>Hotline:</strong> +1 (800) 555-CITY</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setContactOpen(false)} className="px-4 py-2 rounded-lg text-xs font-semibold smart-btn-navy">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}