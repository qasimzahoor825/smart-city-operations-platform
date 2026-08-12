import L from "leaflet";
import type { RichMarker } from "@/hooks/use-gis-portal";
import { TYPE_META } from "./marker-utils";

const GLYPHS: Record<string, string> = {
  complaint:
    '<path d="M7.2 6 h15.6 c0.7 0 1.2 0.5 1.2 1.2 v7.6 c0 0.7 -0.5 1.2 -1.2 1.2 h-8.8 l-3.6 3 v-3 h-3.2 c-0.7 0 -1.2 -0.5 -1.2 -1.2 V7.2 c0 -0.7 0.5 -1.2 1.2 -1.2 z"/>',
  asset: '<path d="M7.2 17 V5.8 h15.6 V17 M7.2 5.8 l3 -3 h9.6 l3 3 M11 17 v-6 h8 v6"/>',
  hospital: '<path d="M15 5 v18 M6 14 h18"/>',
  police: '<path d="M15.4 4.6 l6 2 v6 c0 5 -4.4 7.4 -6 7.8 -1.6 -0.4 -6 -2.8 -6 -7.8 v-6 z M15.4 8 v7"/>',
  emergency: '<path d="M16.5 4.5 l-6.5 10 h5 l-2.5 9 7.5 -12 h-5 z"/>',
};

function pin(pinColor: string, glyph: string): string {
  return `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 1 C7.5 1 2.5 6.5 2.5 12.5 c0 8 12.5 24.5 12.5 24.5 s12.5 -16.5 12.5 -24.5 C27.5 6.5 22.5 1 15 1 z" fill="${pinColor}" stroke="#ffffff" stroke-width="1.6"/>
  <g transform="translate(0 1)" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${glyph}</g>
</svg>`;
}

export function markerIcon(marker: RichMarker): L.DivIcon {
  const meta = TYPE_META[marker.type] ?? { color: "#334155", label: marker.type };
  const glyph = GLYPHS[marker.type] ?? GLYPHS.complaint;
  return L.divIcon({
    html: pin(meta.color, glyph),
    className: "gis-pin",
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -34],
  });
}