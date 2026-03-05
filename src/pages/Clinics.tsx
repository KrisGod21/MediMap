import { Navbar } from "@/components/Navbar";
import { ClinicCard } from "@/components/ClinicCard";
import { ClinicMap } from "@/components/ClinicMap";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "react-router-dom";

interface ClinicData {
  id: number;
  name: string;
  doctor: string;
  specialist: string;
  distance: number;
  rating: number;
  female_doctor: boolean;
  safety_score: number;
  address: string;
  lat?: number;
  lng?: number;
}

// Default clinics for direct navigation
const defaultClinics: ClinicData[] = [
  { id: 1, name: "Mumbai Women's Clinic", doctor: "Dr. Sneha Patel", specialist: "Gynecologist", distance: 2.1, rating: 4.8, female_doctor: true, safety_score: 9, address: "42, Marine Drive, Mumbai 400020", lat: 18.9438, lng: 72.8235 },
  { id: 2, name: "HealthFirst Medical Center", doctor: "Dr. Priya Sharma", specialist: "Gynecologist", distance: 3.4, rating: 4.6, female_doctor: true, safety_score: 8, address: "15, Linking Road, Bandra West, Mumbai 400050", lat: 19.0596, lng: 72.8295 },
  { id: 3, name: "CityLife Hospital", doctor: "Dr. Rajesh Kumar", specialist: "Gynecologist", distance: 4.8, rating: 4.5, female_doctor: false, safety_score: 7, address: "88, Turner Road, Mumbai 400036", lat: 19.0560, lng: 72.8330 },
  { id: 4, name: "Sunrise Women's Health", doctor: "Dr. Ananya Desai", specialist: "Gynecologist", distance: 5.2, rating: 4.9, female_doctor: true, safety_score: 10, address: "21, Juhu Tara Road, Mumbai 400049", lat: 19.0883, lng: 72.8263 },
];

export default function Clinics() {
  const location = useLocation();
  const state = location.state as { clinics?: ClinicData[]; triage?: any } | null;

  const clinics: ClinicData[] = state?.clinics?.length ? state.clinics : defaultClinics;
  const specialist = state?.triage?.specialist ?? "Gynecologist";

  const [femaleDoctorOnly, setFemaleDoctorOnly] = useState(false);
  const filtered = femaleDoctorOnly ? clinics.filter((c) => c.female_doctor) : clinics;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Nearby Clinics</h1>
            <p className="text-muted-foreground">{specialist}s near you, sorted by safety score, distance, and rating.</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="female" checked={femaleDoctorOnly} onCheckedChange={setFemaleDoctorOnly} />
            <Label htmlFor="female" className="text-sm">Female doctors only</Label>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          <div className="space-y-4">
            {filtered.map((c) => (
              <ClinicCard
                key={c.id}
                name={c.name}
                doctor={c.doctor}
                distance={`${c.distance} km`}
                rating={c.rating}
                safetyScore={c.safety_score}
                hasFemaleDoctor={c.female_doctor}
                address={c.address}
              />
            ))}
          </div>

          {/* Interactive map */}
          <div className="hidden lg:block sticky top-24">
            <ClinicMap clinics={filtered} />
          </div>
        </div>
      </div>
    </div>
  );
}
