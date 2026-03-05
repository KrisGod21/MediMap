import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  role: "user" | "ai";
  message: string;
  isLoading?: boolean;
}

/** Minimal inline markdown: **bold** → <strong> */
function renderSimpleMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function ChatBubble({ role, message, isLoading }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isUser ? "bg-primary" : "bg-muted"
      )}>
        {isUser ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-foreground" />}
      </div>
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-card border border-border rounded-bl-md"
      )}>
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-current animate-pulse-dot" />
            <span className="h-2 w-2 rounded-full bg-current animate-pulse-dot [animation-delay:0.2s]" />
            <span className="h-2 w-2 rounded-full bg-current animate-pulse-dot [animation-delay:0.4s]" />
          </div>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(message) }} />
        )}
      </div>
    </div>
  );
}

