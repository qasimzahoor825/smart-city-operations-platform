"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  MapPin,
  ChevronDown,
  Navigation,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { complaintsApi } from "@/services/complaints";
import { aiApi } from "@/services/ai";
import type { ComplaintPriority } from "@/types";

const CATEGORIES = [
  "ROAD",
  "WATER",
  "ELECTRICITY",
  "GARBAGE",
  "PARKS",
  "STREET_LIGHT",
  "NOISE",
  "SANITATION",
  "OTHER",
];

const PRIORITIES: ComplaintPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function SubmitComplaintPage() {
  const router = useRouter();

  const [category, setCategory] = React.useState("ROAD");
  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<ComplaintPriority>("MEDIUM");
  const [latitude, setLatitude] = React.useState<number | null>(null);
  const [longitude, setLongitude] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAssisting, setIsAssisting] = React.useState(false);
  const [aiHint, setAiHint] = React.useState<string | null>(null);

  // Attached sample photo previews matching Screenshot 04
  const [attachedPhotos, setAttachedPhotos] = React.useState<string[]>([]);

  const handleCurrentLocation = () => {
    toast.info("Acquiring current GPS position...");
    if (!("geolocation" in navigator)) {
      setLatitude(40.7128);
      setLongitude(-74.006);
      setLocation("Downtown Metropolis (approximate location)");
      toast.success("Location set to default coordinates");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocation(
          `Current location (${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)})`,
        );
        toast.success("Location updated via GPS");
      },
      () => {
        setLatitude(40.7128);
        setLongitude(-74.006);
        setLocation("Downtown Metropolis (approximate location)");
        toast.success("Location set to default coordinates");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const [isValidatingImage, setIsValidatingImage] = React.useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        setIsValidatingImage(true);
        const result = await aiApi.validateImage(dataUrl, category);
        if (result && result.accepted) {
          setAttachedPhotos((prev) => [...prev, dataUrl]);
          toast.success("Photo verified and attached");
        } else {
          toast.error(result?.reason || "This image does not match the selected category.");
        }
      } catch {
        toast.error("Could not verify the image. Try again.");
      } finally {
        setIsValidatingImage(false);
        if (e.target) e.target.value = "";
      }
    };
    reader.onerror = () => {
      toast.error("Could not read the image file.");
      if (e.target) e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleAiAssist = async () => {
    if (!title.trim() && !description.trim()) {
      toast.error("Add a title or description first");
      return;
    }
    setIsAssisting(true);
    try {
      const result = await aiApi.categorize(title, description);
      if (!result) {
        toast.info("AI Assist returned no suggestions");
        return;
      }
      if (result.category) setCategory(result.category);
      if (PRIORITIES.includes(result.priority as ComplaintPriority)) {
        setPriority(result.priority as ComplaintPriority);
      }
      if (result.summary) {
        setAiHint(result.summary);
        toast.info(`AI Assist suggestion: ${result.summary}`);
      } else {
        toast.success("AI Assist applied the suggested category and priority");
      }
    } catch {
      toast.error("AI Assist could not reach the service");
    } finally {
      setIsAssisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const complaint = await complaintsApi.create({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        latitude,
        longitude,
        address: location.trim() || undefined,
        imageUrls: attachedPhotos.length > 0 ? attachedPhotos : undefined,
      });
      toast.success(`Complaint ${complaint.id} "${complaint.title}" lodged successfully!`);
      router.push("/citizen/dashboard");
    } catch {
      toast.error("Could not submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Breadcrumb & Title matching Screenshot 04 */}
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-semibold tracking-wide">
            Submit a Complaint
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a City Problem
          </h1>
        </div>

        {/* 2-Column Grid matching Screenshot 04 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Column */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Category & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="complaint-cat-select" className="text-xs font-semibold text-slate-700 block">
                    Complaint Category
                  </label>
                  <div className="relative">
                    <select
                      id="complaint-cat-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="complaint-title-input" className="text-xs font-semibold text-slate-700 block">
                    Complaint Title
                  </label>
                  <input
                    id="complaint-title-input"
                    type="text"
                    placeholder="Enter short title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Location Map Picker Box matching Screenshot 04 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="location-input" className="text-xs font-semibold text-slate-700 block">
                      Location
                    </label>
                    <button
                      type="button"
                      onClick={handleCurrentLocation}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5 text-teal-600" />
                      <span>Current Location</span>
                    </button>
                  </div>
                  
                  <input
                    id="location-input"
                    type="text"
                    placeholder="Address or landmark"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                {/* Map Graphic Container matching Screenshot 04 */}
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-300 bg-slate-200 flex items-center justify-center">
                  {/* Map Visual Vector Canvas */}
                  <div className="absolute inset-0 bg-emerald-50/60 opacity-90">
                    <svg className="w-full h-full stroke-slate-300" strokeWidth="2">
                      <line x1="0" y1="40" x2="300" y2="40" stroke="#cbd5e1" strokeWidth="4" />
                      <line x1="120" y1="0" x2="120" y2="200" stroke="#fde047" strokeWidth="6" />
                      <line x1="0" y1="120" x2="300" y2="120" stroke="#cbd5e1" strokeWidth="4" />
                    </svg>
                  </div>

                  {/* Pin Drop Marker */}
                  <div className="relative z-10 p-2 rounded-full bg-teal-700 text-white shadow-lg animate-bounce">
                    <MapPin className="w-5 h-5 fill-teal-100" />
                  </div>

                  <button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-white/90 text-slate-800 text-[10px] font-bold shadow border border-slate-200"
                  >
                    Current Location
                  </button>
                </div>

              </div>

              {/* Row 3: Description Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="complaint-desc-input" className="text-xs font-semibold text-slate-700 block">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAiAssist}
                    disabled={isAssisting}
                    className="px-3 py-1.5 rounded-lg border border-teal-300 hover:bg-teal-50 text-teal-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAssisting ? "animate-pulse" : ""}`} />
                    <span>{isAssisting ? "Analyzing..." : "AI Assist"}</span>
                  </button>
                </div>
                <textarea
                  id="complaint-desc-input"
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                {aiHint && (
                  <div className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-800 leading-relaxed">{aiHint}</p>
                  </div>
                )}
              </div>

              {/* Row 4: Priority & Upload Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Priority Selector matching Screenshot 04 */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Priority Indicator
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    {PRIORITIES.map((p) => {
                      const dotClass =
                        p === "LOW"
                          ? "bg-blue-500"
                          : p === "MEDIUM"
                          ? "bg-amber-500"
                          : p === "HIGH"
                          ? "bg-red-500"
                          : "bg-red-700";
                      const dimClass =
                        p === "LOW"
                          ? "bg-blue-300"
                          : p === "MEDIUM"
                          ? "bg-amber-300"
                          : p === "HIGH"
                          ? "bg-red-300"
                          : "bg-red-400";
                      return (
                        <label key={p} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                          <input
                            type="radio"
                            name="priority"
                            value={p}
                            checked={priority === p}
                            onChange={() => setPriority(p)}
                            className="sr-only"
                          />
                          <span className={`w-3.5 h-3.5 rounded-full ${priority === p ? `ring-2 ring-offset-1 ${dotClass}` : dimClass}`} />
                          <span>{p.toLowerCase()}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Photos Dropzone matching Screenshot 04 */}
                <div className="space-y-1.5">
                  <label htmlFor="photo-upload-input" className="text-xs font-semibold text-slate-700 block">
                    Upload Photos
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 transition-colors">
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {isValidatingImage ? (
                      <span className="animate-spin border-2 border-teal-500/40 border-t-teal-600 rounded-full w-5 h-5 mx-auto mb-1" />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    )}
                    <span className="text-xs font-semibold text-slate-600">
                      {isValidatingImage ? "Verifying image..." : "Drag and drop"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons matching Screenshot 04 */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link
                  href="/citizen/dashboard"
                  className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-xl smart-btn-teal text-sm font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-spin border-2 border-white/40 border-t-white rounded-full w-4 h-4" />
                  ) : (
                    "Submit Complaint"
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-500 pt-1">
                Your complaint will automatically be routed to the relevant government department.
              </p>

            </form>
          </div>

          {/* Right Live Preview Panel Column matching Screenshot 04 */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Complaint Preview
            </h2>

            <div className="space-y-4 text-xs">
              
              <div>
                <span className="text-slate-400 block font-medium mb-0.5">Category</span>
                <span className="font-bold text-slate-900 text-sm">{category}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-0.5">Location</span>
                <span className="font-semibold text-slate-800">{location || "Not set yet"}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-0.5">Description</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  {description || "No description provided yet..."}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-2">Attached Photos</span>
                {attachedPhotos.length === 0 ? (
                  <p className="text-slate-400">No photos attached</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {attachedPhotos.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Attached preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Preview Active
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}