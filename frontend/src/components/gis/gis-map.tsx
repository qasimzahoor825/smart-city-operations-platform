"use client";

import { memo, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";

import { MAP_ATTRIBUTION, MAP_TILE_KEY, MAP_TILE_URL } from "@/config/env";
import type { RichMarker } from "@/hooks/use-gis-portal";
import { markerIcon } from "./marker-icons";
import { typeLabel } from "./marker-utils";

const PAKISTAN_CENTER: [number, number] = [33.6844, 73.0479];

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

function popupHtml(marker: RichMarker): string {
  const department = marker.department ? `<br/><span style="color:#475569">${marker.department}</span>` : "";
  const priority = marker.priority ? `<br/><b>Priority:</b> ${marker.priority}` : "";
  const status = marker.status ? `<br/><b>Status:</b> ${marker.status}` : "";
  const address = marker.address ? `<br/><span style="color:#64748b">${marker.address}</span>` : "";
  return `
    <div style="font-size:12px;line-height:1.6;min-width:180px">
      <b style="color:#0f172a">${marker.title}</b>
      ${department}
      <br/><b>Type:</b> ${typeLabel(marker.type)}
      ${status}
      ${priority}
      ${address}
    </div>`;
}

export interface GisMapProps {
  markers: RichMarker[];
  mapStyle: "streets" | "satellite";
  focus?: { latitude: number; longitude: number; nonce: number } | null;
  onSelect?: (marker: RichMarker) => void;
  fitOnLoad?: boolean;
}

/**
 * Leaflet map with marker clustering. Markers are diffed by id so polling
 * updates never tear down / rebuild the whole layer, keeping the map fast.
 */
function GisMap({ markers, mapStyle, focus, onSelect, fitOnLoad }: GisMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markerById = useRef<Map<string, L.Marker>>(new Map());
  const signatureById = useRef<Map<string, string>>(new Map());
  const fitted = useRef(false);

  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { center: PAKISTAN_CENTER, zoom: 6 });
    mapRef.current = map;
    tileRef.current = L.tileLayer(buildTileUrl(mapStyle), {
      attribution: MAP_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    clusterRef.current = L.markerClusterGroup({
      maxClusterRadius: 46,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 16,
    }).addTo(map);
    const markerRegistry = markerById.current;
    const signatureRegistry = signatureById.current;
    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      tileRef.current = null;
      markerRegistry.clear();
      signatureRegistry.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap basemap without recreating the layer.
  useEffect(() => {
    if (tileRef.current) tileRef.current.setUrl(buildTileUrl(mapStyle));
  }, [mapStyle]);

  // Diff-based marker rendering.
  useEffect(() => {
    const cluster = clusterRef.current;
    const map = mapRef.current;
    if (!cluster || !map) return;

    const nextIds = new Set(markers.map((m) => m.id));

    // Remove stale markers.
    const stale: L.Marker[] = [];
    markerById.current.forEach((leafletMarker, id) => {
      if (!nextIds.has(id)) {
        stale.push(leafletMarker);
        markerById.current.delete(id);
        signatureById.current.delete(id);
      }
    });
    if (stale.length > 0) cluster.removeLayers(stale);

    // Update changed + insert new markers.
    const added: L.Marker[] = [];
    markers.forEach((marker) => {
      const id = marker.id;
      const sig = `${id}|${marker.latitude}|${marker.longitude}|${marker.title}|${marker.status ?? ""}|${marker.type}|${
        marker.priority ?? ""
      }`;
      if (signatureById.current.get(id) === sig) return;

      const existing = markerById.current.get(id);
      if (existing) {
        existing.setLatLng([marker.latitude, marker.longitude]);
        existing.setIcon(markerIcon(marker));
        existing.setPopupContent(popupHtml(marker));
      } else {
        const leafletMarker = L.marker([marker.latitude, marker.longitude], {
          icon: markerIcon(marker),
          riseOnHover: true,
        });
        leafletMarker.bindPopup(popupHtml(marker), { minWidth: 220, maxWidth: 300 });
        leafletMarker.on("click", () => selectRef.current?.(marker));
        markerById.current.set(id, leafletMarker);
        added.push(leafletMarker);
      }
      signatureById.current.set(id, sig);
    });
    if (added.length > 0) cluster.addLayers(added);

    // Fit bounds once when live data first arrives.
    if (fitOnLoad && !fitted.current && markers.length > 0) {
      fitted.current = true;
      map.fitBounds(L.latLngBounds(markers.map((m) => [m.latitude, m.longitude] as [number, number])).pad(0.16), {
        maxZoom: 14,
      });
    }
  }, [markers, fitOnLoad]);

  useEffect(() => {
    if (focus && mapRef.current) {
      mapRef.current.flyTo([focus.latitude, focus.longitude], 15, { duration: 0.8 });
    }
  }, [focus]);

  return <div ref={mapEl} className="absolute inset-0 h-full w-full" />;
}

export default memo(GisMap);