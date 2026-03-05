import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Activity, Brain, Search, Stethoscope, ArrowRight, Heart, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Stethoscope,
    title: "AI Symptom Intake",
    description: "Describe your symptoms naturally and our AI guides you through a clinical-grade intake process.",
  },
  {
    icon: Brain,
    title: "Smart Medical Triage",
    description: "Get an instant urgency assessment and know which specialist to see — and how soon.",
  },
  {
    icon: Search,
    title: "Clinic Finder & Booking",
    description: "Find women-safe clinics nearby, compare doctors, and book appointments in seconds.",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <p className="text-sm font-medium text-primary tracking-wide uppercase">From symptoms to care — instantly.</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
              AI Healthcare Navigator{" "}
              <span className="text-primary">for Women</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Describe how you feel, get triaged by AI, find the right doctor, and book an appointment — all in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2 text-base px-8 rounded-xl" onClick={() => navigate("/consultation")}>
                Start Consultation <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 rounded-xl">
                Learn More
              </Button>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative hidden lg:flex items-center justify-center animate-scale-in">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-primary/10" />
              <div className="absolute inset-6 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                <div className="relative">
                  <Activity className="h-24 w-24 text-primary/60" />
                  <Heart className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-pulse" />
                  <Shield className="absolute -bottom-1 -left-3 h-7 w-7 text-success" />
                </div>
              </div>
              <div className="absolute -top-4 right-8 bg-card border border-border rounded-xl p-3 shadow-lg animate-fade-in [animation-delay:0.3s]">
                <p className="text-xs text-muted-foreground">AI Assessment</p>
                <p className="text-sm font-semibold text-foreground">98% accuracy</p>
              </div>
              <div className="absolute -bottom-2 left-4 bg-card border border-border rounded-xl p-3 shadow-lg animate-fade-in [animation-delay:0.5s]">
                <p className="text-xs text-muted-foreground">Trusted by</p>
                <p className="text-sm font-semibold text-foreground">10k+ women</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20 md:pb-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Three simple steps from feeling unwell to getting the right care.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="border border-border hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Activity className="h-4 w-4 text-primary" /> MediMap AI
          </div>
          <p>© 2026 MediMap AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
