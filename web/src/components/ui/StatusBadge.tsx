import React from "react";

type StatusType = "on-track" | "due-soon" | "overdue" | "recovery" | "complete";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  pulsate?: boolean;
}

const statusConfig: Record<StatusType, { bg: string; text: string; dot: string; defaultLabel: string; animation: string }> = {
  "on-track": {
    bg: "bg-[var(--color-success-bg)]",
    text: "text-[var(--color-success)]",
    dot: "bg-[var(--color-success)]",
    defaultLabel: "On Track",
    animation: "animate-[pulse-green_2s_ease-in-out_infinite]",
  },
  "due-soon": {
    bg: "bg-[var(--color-warning-bg)]",
    text: "text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)]",
    defaultLabel: "Due Soon",
    animation: "animate-[pulse-amber_2s_ease-in-out_infinite]",
  },
  overdue: {
    bg: "bg-[var(--color-danger-bg)]",
    text: "text-[var(--color-danger)]",
    dot: "bg-[var(--color-danger)]",
    defaultLabel: "Overdue",
    animation: "animate-[pulse-red_1.5s_ease-in-out_infinite]",
  },
  recovery: {
    bg: "bg-[var(--color-danger-bg)]",
    text: "text-[var(--color-danger)]",
    dot: "bg-[var(--color-danger)]",
    defaultLabel: "Needs Attention",
    animation: "animate-[pulse-red_1s_ease-in-out_infinite]",
  },
  complete: {
    bg: "bg-[var(--color-info-bg)]",
    text: "text-[var(--color-info)]",
    dot: "bg-[var(--color-info)]",
    defaultLabel: "Replaced",
    animation: "",
  },
};

export default function StatusBadge({ status, label, pulsate = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`
        inline-flex items-center gap-2 px-3 py-1.5
        rounded-[var(--radius-full)] font-medium text-sm
        ${config.bg} ${config.text}
      `}
      role="status"
      aria-label={label || config.defaultLabel}
    >
      <span
        className={`w-2 h-2 rounded-full ${config.dot} ${pulsate ? config.animation : ""}`}
      />
      {label || config.defaultLabel}
    </span>
  );
}
