import React from "react";
import StatusBadge from "./StatusBadge";

type StatusType = "on-track" | "due-soon" | "overdue" | "recovery" | "complete";

interface DatePanelProps {
  daysRemaining: number;
  nextDate: string; /* e.g., "April 21, 2026" */
  status: StatusType;
  productName?: string;
}

function getStatusFromDays(days: number): StatusType {
  if (days > 7) return "on-track";
  if (days > 0) return "due-soon";
  if (days > -7) return "overdue";
  return "recovery";
}

export default function DatePanel({ daysRemaining, nextDate, status, productName }: DatePanelProps) {
  const resolvedStatus = status || getStatusFromDays(daysRemaining);
  const isOverdue = daysRemaining <= 0;

  const ringColor = {
    "on-track": "stroke-[var(--color-success)]",
    "due-soon": "stroke-[var(--color-warning)]",
    overdue: "stroke-[var(--color-danger)]",
    recovery: "stroke-[var(--color-danger)]",
    complete: "stroke-[var(--color-info)]",
  }[resolvedStatus];

  /* Ring progress: maps 30 days → full circle */
  const progress = Math.max(0, Math.min(1, daysRemaining / 30));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center text-center py-6 animate-fade-up">
      {/* Circular countdown */}
      <div className="relative w-40 h-40 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            className="stroke-[var(--color-border)]"
            strokeWidth="6"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            className={`${ringColor} transition-all duration-1000`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-[var(--color-text)]">
            {isOverdue ? `${Math.abs(daysRemaining)}` : daysRemaining}
          </span>
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {isOverdue ? "days overdue" : "days left"}
          </span>
        </div>
      </div>

      <StatusBadge status={resolvedStatus} />

      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {isOverdue ? "Was due" : "Next replacement"}: <strong>{nextDate}</strong>
      </p>

      {productName && (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{productName}</p>
      )}
    </div>
  );
}
