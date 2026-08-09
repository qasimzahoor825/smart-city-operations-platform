"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { MAP_ATTRIBUTION, MAP_TILE_KEY, MAP_TILE_URL } from "@/config/env";
import type { MapMarker } from "@/types";

const TYPE_COLOR: Record<string, string> = {
  complaint: "#0d9488",
  asset: "#155e75",
  hospital: "#4f46e5",
  police: "#1f2937",
  emergency: "#dc2626",
};

const TYPE_LABEL: Record<string, string> = {
  complaint: "Complaint",
  asset: "Asset",
  hospital: "Hospital",
  police: "Police",
  emergency: "Emergency",
};

function buildTileUrl(mapStyle: "streets" | "satellite"): string {
  let url = MAP_TILE_URL;
  if (mapStyle === "satellite") {
    url = url.replace("lyrs=m", "lyrs=s");
  }
  if (MAP_TILE_KEY && url.includes("{key}")) {
    url = url.replace("{key}", MAP_TILE_KEY);
  }
  return url;
}

function divIcon(marker: MapMarker): L.DivIcon {
  const letter =
    marker.type === "emergency" ? "!" : marker.type === "hospital" ? "H" : marker.type === "police" ? "P" : marker.type === "asset" ? "A" : "C";
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:11px;width:22px;height:22px;border-radius:50%;background:${
      TYPE_COLOR[marker.type] ?? "#334155"
    };border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);">${letter}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export interface GisMapProps {
  markers: MapMarker[];
  mapStyle: "streets" | "satellite";
  focus?: { latitude: number; longitude: number; nonce: number } | null;
  onSelect?: (marker: MapMarker) => void;
}

export default function GisMap({ markers, mapStyle, focus, onSelect }: GisMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);

  // Initialize map once.
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { center: [31.5497, 74.3436], zoom: 13 });
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    tileRef.current = L.tileLayer(buildTileUrl(mapStyle), {
      attribution: MAP_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      tileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap basemap on Streets/Satellite toggle.
  useEffect(() => {
    if (!tileRef.current || !mapRef.current) return;
    const old = tileRef.current;
    tileRef.current = L.tileLayer(buildTileUrl(mapStyle), {
      attribution: MAP_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(mapRef.current);
    old.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]);

  // Re-render markers when the filtered list changes.
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    markers.forEach((m) => {
      const marker = L.marker([m.latitude, m.longitude], { icon: divIcon(m) });
      marker.bindPopup(
        `<div style="font-size:12px;line-height:1.5"><b>${m.title}</b><br/>Type: ${
          TYPE_LABEL[m.type] ?? m.type
        }<br/>Status: ${m.status ?? "—"}<br/>${m.address ?? ""}</div>`,
      );
      if (onSelect) marker.on("click", () => onSelect(m));
      layerRef.current!.addLayer(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  // Fly to a focused point (from search).
  useEffect(() => {
    if (focus && mapRef.current) {
      mapRef.current.flyTo([focus.latitude, focus.longitude], 15);
    }
  }, [focus]);

  return <div ref={mapEl} className="absolute inset-0 h-full w-full" />;
}