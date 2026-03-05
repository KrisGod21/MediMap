import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Navigation, Bell, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Confirmation() {
  const location = useLocation();
  const state = location.state as {
    appointment?: {
      id: number;
      clinic_name: string;
      doctor: string;
      time: string;
      status: string;
    };
    followup?: {
      followup_date?: string;
      message?: string;
    };
    clinicAddress?: string;
  } | null;

  const appointment = state?.appointment ?? {
    id: 0,
    clinic_name: "Mumbai Women's Clinic",
    doctor: "Dr. Sneha Patel",
    time: "March 5, 2026 — 10:30 AM",
    status: "confirmed",
  };

  const followup = state?.followup ?? {
    message: "We'll check on your symptoms after your appointment and help with any follow-up care you may need.",
  };

  const clinicAddress = state?.clinicAddress ?? "42, Marine Drive, Mumbai 400020";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg py-16 md:py-24 animate-fade-in">
        <Card className="border border-border shadow-lg overflow-hidden">
          <div className="bg-success/10 py-8 flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Appointment Confirmed</h1>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              {[
                { label: "Doctor", value: appointment.doctor },
                { label: "Clinic", value: appointment.clinic_name },
                { label: "Date & Time", value: appointment.time },
                { label: "Address", value: clinicAddress },
                { label: "Status", value: appointment.status === "confirmed" ? "✅ Confirmed" : appointment.status },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground text-right">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2 rounded-xl">
                <Calendar className="h-4 w-4" /> Add to Calendar
              </Button>
              <Button variant="outline" className="flex-1 gap-2 rounded-xl">
                <Navigation className="h-4 w-4" /> Get Directions
              </Button>
            </div>

            {/* Follow-up section */}
            <div className="space-y-3">
              {followup.followup_date && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up Scheduled</p>
                    <p className="text-sm font-semibold text-foreground">{followup.followup_date}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {followup.message || "We'll check on your symptoms after your appointment and help with any follow-up care you may need."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
