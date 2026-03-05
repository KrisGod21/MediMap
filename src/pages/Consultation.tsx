import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/ChatBubble";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { Activity, Send, Mic, Plus, MessageSquare, Settings, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface TriageData {
  urgency: string;
  specialist: string;
  timeframe: string;
  explanation: string;
}

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
}

interface IntakeData {
  symptoms: string[];
  duration: string | null;
  pain_level: string | null;
}

const initialMessages: Message[] = [
  { role: "ai", text: "Hi! I'm MediMap AI, your healthcare navigator. Tell me — what symptoms are you experiencing today?" },
];

const pastConsultations = [
  { id: 1, title: "Headache & fatigue", date: "Feb 28" },
  { id: 2, title: "Routine checkup", date: "Feb 15" },
];

// Loading steps shown during the agent pipeline
const PIPELINE_STEPS = [
  "🔍 Extracting symptoms...",
  "⚕️ Running triage assessment...",
  "🏥 Finding nearby clinics...",
  "✅ Preparing your results...",
];

export default function Consultation() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [collectedSymptoms, setCollectedSymptoms] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<TriageData | null>(null);
  const [clinicsResult, setClinicsResult] = useState<ClinicData[]>([]);
  const [intakeResult, setIntakeResult] = useState<IntakeData | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Animate through loading steps
  const animateLoadingSteps = async () => {
    for (const step of PIPELINE_STEPS) {
      setLoadingText(step);
      await new Promise((r) => setTimeout(r, 600));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    if (!hasAnalyzed) {
      // First symptom message: run the full agent pipeline
      const loadingPromise = animateLoadingSteps();

      try {
        const [response] = await Promise.all([
          fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userMessage,
              collected_symptoms: collectedSymptoms
            }),
          }),
          loadingPromise, // ensure animation completes
        ]);

        if (!response.ok) throw new Error("Failed to analyze symptoms");

        const data = await response.json();

        // Always save any symptoms the agent managed to extract
        if (data.intake && data.intake.symptoms) {
          setCollectedSymptoms(data.intake.symptoms);
        }

        // If not complete, AI is asking a follow-up question
        if (!data.is_complete) {
          setMessages((prev) => [...prev, { role: "ai", text: data.ai_message }]);
          setIsLoading(false);
          setLoadingText("");
          return;
        }

        // ML prediction complete! We have triage & clinics data
        setIntakeResult(data.intake);
        setTriageResult(data.triage);
        setClinicsResult(data.clinics);
        setHasAnalyzed(true);

        // Show the AI summary
        setMessages((prev) => [...prev, { role: "ai", text: data.ai_message }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "I'm sorry, I had trouble analyzing your symptoms. Please try again or describe them differently." },
        ]);
      }
    } else {
      // Post-analysis follow-up: user just asking questions after the fact
      setLoadingText("🔍 Answering your follow-up...");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, collected_symptoms: collectedSymptoms }),
        });

        if (!response.ok) throw new Error("Failed to analyze");

        const data = await response.json();

        // Update collected symptoms
        if (data.intake && data.intake.symptoms) {
          setCollectedSymptoms(data.intake.symptoms);
        }

        if (data.intake && data.intake.symptoms && data.intake.symptoms.length > 0) {
          setIntakeResult(data.intake);
          if (data.triage) setTriageResult(data.triage);
          if (data.clinics) setClinicsResult(data.clinics);
          setMessages((prev) => [...prev, { role: "ai", text: data.ai_message }]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: "Thank you for the additional details. Based on my earlier assessment, I still recommend viewing your triage results and finding a nearby specialist. Click the button below to proceed.",
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Thank you for the additional details. Based on my earlier assessment, I still recommend viewing your triage results. Click the button below to proceed.",
          },
        ]);
      }
    }

    setIsLoading(false);
    setLoadingText("");
  };

  const urgencyToLevel = (urgency: string): "low" | "medium" | "urgent" => {
    switch (urgency) {
      case "HIGH": return "urgent";
      case "MEDIUM": return "medium";
      default: return "low";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static z-40 w-72 h-full border-r border-border bg-card flex flex-col transition-transform`}>
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-bold text-foreground mb-4">
            <Activity className="h-5 w-5 text-primary" />
            MediMap AI
          </Link>
          <Button className="w-full gap-2 rounded-xl" size="sm" onClick={() => window.location.reload()}>
            <Plus className="h-4 w-4" /> New Consultation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-2 uppercase tracking-wider">Past Consultations</p>
          {pastConsultations.map((c) => (
            <button key={c.id} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors text-left">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{c.title}</span>
              <span className="ml-auto text-xs opacity-60">{c.date}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <button className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card/50 backdrop-blur-sm">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </button>
          <h2 className="font-medium text-foreground text-sm">New Consultation</h2>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} message={msg.text} />
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-4 w-4 text-foreground animate-spin" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 text-sm text-muted-foreground">
                <span className="animate-pulse">{loadingText || "Thinking..."}</span>
              </div>
            </div>
          )}

          {/* Triage result card */}
          {triageResult && hasAnalyzed && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 max-w-md space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">✅ Symptom analysis complete</p>
                  <UrgencyBadge level={urgencyToLevel(triageResult.urgency)} />
                </div>
                {intakeResult && intakeResult.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {intakeResult.symptoms.map((s, i) => (
                      <span key={i} className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{triageResult.specialist}</strong> recommended — {triageResult.timeframe}
                </p>
                <Button
                  size="sm"
                  className="gap-2 rounded-xl"
                  onClick={() =>
                    navigate("/triage", {
                      state: { triage: triageResult, intake: intakeResult, clinics: clinicsResult },
                    })
                  }
                >
                  View Triage Results <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4 bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-xl">
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Describe your symptoms..."
              className="rounded-xl"
            />
            <Button size="icon" className="shrink-0 rounded-xl" onClick={handleSend} disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
