import React from "react";
import { User, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

type StatusType = "on-track" | "due-soon" | "overdue" | "recovery" | "complete";

interface CaregiverCardProps {
  name: string;
  relationship?: string;
  daysRemaining: number;
  status: StatusType;
  onClick?: () => void;
}

export default function CaregiverCard({
  name,
  relationship = "Family member",
  daysRemaining,
  status,
  onClick,
}: CaregiverCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-4 rounded-[var(--radius-md)]
        bg-[var(--color-surface)] border border-[var(--color-border)]
        shadow-[var(--shadow-card)] text-left
        hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary)]/30
        transition-all duration-200 cursor-pointer
      `}
    >
      <div className="w-10 h-10 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center shrink-0">
        <User size={20} className="text-[var(--color-text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--color-text)] truncate">{name}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{relationship}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={status} label={`${Math.abs(daysRemaining)}d`} pulsate={false} />
        <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
      </div>
    </button>
  );
}
