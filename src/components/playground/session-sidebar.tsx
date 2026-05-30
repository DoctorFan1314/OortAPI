"use client";

import { Plus, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
}

interface Props {
  sessions: Session[];
  currentSessionId: string;
  onCreateSession: () => void;
  onSwitchSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  newSessionLabel: string;
  deleteSessionLabel: string;
}

export function SessionSidebar({ sessions, currentSessionId, onCreateSession, onSwitchSession, onDeleteSession, newSessionLabel, deleteSessionLabel }: Props) {
  return (
    <aside className="w-56 h-full border-r border-border/90 bg-muted/20 backdrop-blur-sm p-3 flex flex-col shrink-0">
      <button onClick={onCreateSession} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/50 mb-3">
        <Plus className="h-4 w-4" /><span>{newSessionLabel}</span>
      </button>
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
        {sessions.map((s) => (
          <div
            key={`session-${s.id}`}
            onClick={() => onSwitchSession(s.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSwitchSession(s.id); } }}
            role="button"
            tabIndex={0}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
              s.id === currentSessionId
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 truncate">{s.title}</span>
            {sessions.length > 1 && (
              <button
                onClick={(e) => onDeleteSession(e, s.id)}
                aria-label={deleteSessionLabel}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
