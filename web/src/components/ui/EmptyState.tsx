import React from "react";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-4">
        {icon || <PackageOpen size={32} className="text-[var(--color-text-muted)]" />}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
