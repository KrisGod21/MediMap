import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

type Urgency = "low" | "medium" | "urgent";

interface UrgencyBadgeProps {
  level: Urgency;
  className?: string;
}

const config: Record<Urgency, { label: string; icon: typeof CheckCircle; bg: string; text: string }> = {
  low: { label: "Low Urgency", icon: CheckCircle, bg: "bg-success/15", text: "text-success" },
  medium: { label: "Medium Urgency", icon: AlertTriangle, bg: "bg-warning/15", text: "text-warning" },
  urgent: { label: "High Urgency", icon: AlertCircle, bg: "bg-destructive/15", text: "text-destructive" },
};

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  const { label, icon: Icon, bg, text } = config[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", bg, text, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
