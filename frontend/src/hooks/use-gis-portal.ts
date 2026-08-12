"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { gisApi } from "@/services/gis";
import { complaintsApi } from "@/services/complaints";
import { assetsApi, emergenciesApi } from "@/services/operations";
import type { Asset, Complaint, Emergency, MapMarker } from "@/types";

export interface RichMarker extends MapMarker {
  category?: string;
  priority?: string;
  department?: string;
  source?: string;
}

export interface GisFilters {
  departments: string[];
  categories: string[];
  statuses: string[];
  priorities: string[];
}

export interface GisFilterOptions {
  departments: string[];
  categories: string[];
  statuses: string[];
  priorities: string[];
}

export interface GisPortalData {
  markers: RichMarker[];
  layers: string[];
  complaints: Complaint[];
  assets: Asset[];
  emergencies: Emergency[];
  loading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

const EMERGENCY_DEPARTMENT: Record<string, string> = {
  FIRE: "Rescue & Fire Brigade",
  MEDICAL: "Health & Emergency Services",
  FLOOD: "District Disaster Management",
  ACCIDENT: "Rescue 1122",
  PUBLIC_ALERT: "Emergency Response Division",
};

const unique = (values: Array<string | undefined | null>): string[] =>
  Array.from(new Set(values.filter((v): v is string => v != null && v.length > 0))).sort();

function emergencyDepartment(type: string): string | undefined {
  return EMERGENCY_DEPARTMENT[type] ?? "Emergency Response Division";
}

function enrichRawMarker(
  marker: MapMarker,
  complaints: Map<string, Complaint>,
  emergencies: Map<string, Emergency>,
): RichMarker {
  const base: RichMarker = { ...marker };
  if (marker.id.startsWith("cmp:")) {
    const complaint = complaints.get(marker.id.slice(4));
    if (complaint) {
      base.category = complaint.category;
      base.priority = complaint.priority;
      base.department = complaint.departmentName ?? undefined;
      base.source = "Complaint";
    }
  } else if (marker.id.startsWith("emg:")) {
    const emergency = emergencies.get(marker.id.slice(4));
    if (emergency) {
      base.category = emergency.type;
      base.priority = emergency.severity;
      base.department = emergencyDepartment(emergency.type);
      base.source = "Emergency";
    }
  } else if (marker.type === "hospital") {
    base.category = "HEALTH";
    base.department = "Health Department";
  } else if (marker.type === "police") {
    base.category = "PUBLIC_SAFETY";
    base.department = "Police Department";
  } else if (marker.type === "asset") {
    base.department = "Public Assets Authority";
  }
  return base;
}

export function useGisPortal(pollIntervalMs = 20000) {
  const [data, setData] = useState<GisPortalData>({
    markers: [],
    layers: [],
    complaints: [],
    assets: [],
    emergencies: [],
    loading: true,
    lastUpdated: null,
    error: null,
  });

  const mounted = useRef(true);

  const load = useCallback(async () => {
    const [rawResult, layersResult, complaintsResult, assetsResult, emergenciesResult] = await Promise.allSettled([
      gisApi.markers(),
      gisApi.layers(),
      complaintsApi.list({ limit: 500 }),
      assetsApi.list({ limit: 500 }),
      emergenciesApi.list(),
    ]);

    if (!mounted.current) return;

    const complaints = new Map<string, Complaint>();
    let complaintList: Complaint[] = [];
    if (complaintsResult.status === "fulfilled") {
      complaintList = complaintsResult.value.data;
      complaintList.forEach((c) => complaints.set(c.id, c));
    }

    const emergencies = new Map<string, Emergency>();
    let emergencyList: Emergency[] = [];
    if (emergenciesResult.status === "fulfilled") {
      emergencyList = emergenciesResult.value;
      emergencyList.forEach((e) => emergencies.set(e.id, e));
    }

    let markers: RichMarker[] = [];
    if (rawResult.status === "fulfilled") {
      markers = rawResult.value.map((m) => enrichRawMarker(m, complaints, emergencies));
    }

    let assetList: Asset[] = [];
    if (assetsResult.status === "fulfilled") {
      assetList = assetsResult.value;
      const assetMarkers: RichMarker[] = assetList
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => ({
          id: `ast:${a.id}`,
          type: "asset" as const,
          title: a.name,
          latitude: a.latitude as number,
          longitude: a.longitude as number,
          status: a.status,
          address: a.address,
          category: a.category,
          department: a.department,
          source: "Public Asset",
        }));
      const existing = new Set(markers.map((m) => m.id));
      markers = [...markers, ...assetMarkers.filter((m) => !existing.has(m.id))];
    }

    const layers = layersResult.status === "fulfilled" ? layersResult.value.map((l) => l.name) : [];
    const failed = [rawResult, layersResult, complaintsResult, assetsResult, emergenciesResult].some(
      (r) => r.status === "rejected",
    );

    const next: GisPortalData = {
      markers,
      layers,
      complaints: complaintList,
      assets: assetList,
      emergencies: emergencyList,
      loading: false,
      lastUpdated: new Date(),
      error: failed ? "Some GIS services are unreachable. Showing available data." : null,
    };
    setData(next);
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();

    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, pollIntervalMs);

    return () => {
      mounted.current = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load, pollIntervalMs]);

  const options = useMemo<GisFilterOptions>(
    () => ({
      departments: unique(data.markers.map((m) => m.department)),
      categories: unique(data.markers.map((m) => m.category)),
      statuses: unique(data.markers.map((m) => m.status)),
      priorities: unique(data.markers.map((m) => m.priority)),
    }),
    [data.markers],
  );

  return { data, options, refresh: load };
}

export function filterMarkers(markers: RichMarker[], filters: GisFilters): RichMarker[] {
  return markers.filter(
    (m) =>
      (filters.departments.length === 0 || (m.department != null && filters.departments.includes(m.department))) &&
      (filters.categories.length === 0 || (m.category != null && filters.categories.includes(m.category))) &&
      (filters.statuses.length === 0 || (m.status != null && filters.statuses.includes(m.status))) &&
      (filters.priorities.length === 0 || (m.priority != null && filters.priorities.includes(m.priority))),
  );
}
