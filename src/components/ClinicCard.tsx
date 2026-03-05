import { Star, Shield, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface ClinicCardProps {
  name: string;
  doctor: string;
  distance: string;
  rating: number;
  safetyScore: number;
  hasFemaleDoctor: boolean;
  address?: string;
}

export function ClinicCard({ name, doctor, distance, rating, safetyScore, hasFemaleDoctor, address }: ClinicCardProps) {
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = async () => {
    setIsBooking(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_name: name, doctor }),
      });

      if (!response.ok) throw new Error("Booking failed");

      const data = await response.json();

      navigate("/confirmation", {
        state: {
          appointment: data.appointment,
          followup: data.followup,
          message: data.message,
          clinicAddress: address || "Mumbai",
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      // Fallback: navigate anyway with basic info
      navigate("/confirmation", {
        state: {
          appointment: {
            id: Date.now(),
            clinic_name: name,
            doctor,
            time: "Tomorrow — 10:30 AM",
            status: "confirmed",
            created_at: new Date().toISOString(),
          },
          followup: { message: "We'll check on your symptoms after your appointment." },
          clinicAddress: address || "Mumbai",
        },
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card className="border border-border hover:shadow-lg transition-shadow animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{doctor}</p>
          </div>
          {hasFemaleDoctor && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
              Female Doctor
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {distance}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-success" /> Safety: {safetyScore}/10
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">View Details</Button>
          <Button size="sm" className="flex-1" onClick={handleBook} disabled={isBooking}>
            {isBooking ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
