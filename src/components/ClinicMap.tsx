import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue with bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Clinic {
    id: number;
    name: string;
    doctor: string;
    distance: number;
    rating: number;
    safety_score: number;
    lat?: number;
    lng?: number;
}

interface ClinicMapProps {
    clinics: Clinic[];
    className?: string;
}

export function ClinicMap({ clinics, className = "" }: ClinicMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // If map already exists, remove it
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Filter clinics with valid coordinates
        const validClinics = clinics.filter(
            (c) => c.lat && c.lng && c.lat !== 0 && c.lng !== 0
        );

        // Default center: Mumbai
        const defaultCenter: [number, number] = [19.0176, 72.8562];

        const center: [number, number] =
            validClinics.length > 0
                ? [validClinics[0].lat!, validClinics[0].lng!]
                : defaultCenter;

        const map = L.map(mapRef.current, {
            scrollWheelZoom: true,
            zoomControl: true,
        }).setView(center, 12);

        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);

        // Add markers for each clinic
        validClinics.forEach((clinic) => {
            const marker = L.marker([clinic.lat!, clinic.lng!]).addTo(map);
            marker.bindPopup(
                `<div style="min-width: 180px; font-family: system-ui, sans-serif;">
          <strong style="font-size: 14px;">${clinic.name}</strong><br/>
          <span style="color: #666; font-size: 12px;">${clinic.doctor}</span><br/>
          <div style="margin-top: 6px; display: flex; gap: 10px; font-size: 12px; color: #444;">
            <span>📍 ${clinic.distance} km</span>
            <span>⭐ ${clinic.rating}</span>
            <span>🛡️ ${clinic.safety_score}/10</span>
          </div>
        </div>`
            );
        });

        // Fit bounds to show all markers
        if (validClinics.length > 1) {
            const bounds = L.latLngBounds(
                validClinics.map((c) => [c.lat!, c.lng!] as [number, number])
            );
            map.fitBounds(bounds, { padding: [40, 40] });
        }

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [clinics]);

    return (
        <div
            ref={mapRef}
            className={`rounded-2xl border border-border overflow-hidden ${className}`}
            style={{ minHeight: "400px", width: "100%", zIndex: 0 }}
        />
    );
}
