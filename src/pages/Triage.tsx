import { Navbar } from "@/components/Navbar";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, UserCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TriageData {
  urgency: string;
  specialist: string;
  timeframe: string;
  explanation: string;
}

export default function Triage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state or use defaults
  const state = location.state as {
    triage?: TriageData;
    intake?: { symptoms: string[]; duration: string | null; pain_level: string | null };
    clinics?: any[];
  } | null;

  const triage = state?.triage ?? {
    urgency: "MEDIUM",
    specialist: "Gynecologist",
    timeframe: "Within 6 hours",
    explanation:
      "Based on your symptoms, we recommend seeing a gynecologist within 6 hours. These symptoms suggest a condition that needs prompt but non-emergency medical attention.",
  };

  const intake = state?.intake ?? { symptoms: ["cramps", "dizziness"], duration: null, pain_level: null };
  const clinics = state?.clinics ?? [];

  const urgencyToLevel = (urgency: string): "low" | "medium" | "urgent" => {
    switch (urgency) {
      case "HIGH":
        return "urgent";
      case "MEDIUM":
        return "medium";
      default:
        return "low";
    }
  };

  const symptomsText = intake.symptoms.join(" and ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-12 md:py-20 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Health Assessment</h1>
        <p className="text-muted-foreground mb-8">Based on the symptoms you described, here is your triage result.</p>

        <Card className="border border-border shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-semibold text-foreground">Triage Result</h2>
              <UrgencyBadge level={urgencyToLevel(triage.urgency)} />
            </div>

            {/* Detected symptoms */}
            {intake.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {intake.symptoms.map((symptom, i) => (
                  <span
                    key={i}
                    className="inline-block bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
                <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Recommended Specialist</p>
                  <p className="font-semibold text-foreground">{triage.specialist}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
                <Clock className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Timeframe</p>
                  <p className="font-semibold text-foreground">{triage.timeframe}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {triage.explanation}
              </p>
            </div>

            <Button
              className="w-full gap-2 rounded-xl"
              size="lg"
              onClick={() =>
                navigate("/clinics", {
                  state: { clinics, triage, intake },
                })
              }
            >
              Find Nearby Clinics <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
