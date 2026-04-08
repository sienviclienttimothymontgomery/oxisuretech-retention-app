import React from "react";
import { Check } from "lucide-react";

interface RadioCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onSelect: (value: string) => void;
  features?: string[];
  badge?: string;
}

export default function RadioCard({
  value,
  label,
  description,
  icon,
  selected,
  onSelect,
  features,
  badge,
}: RadioCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={`
        w-full text-left rounded-[var(--radius-md)] p-5
        border-2 transition-all duration-200
        cursor-pointer relative
        ${selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[var(--shadow-md)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-sm)]"
        }
      `}
    >
      {badge && (
        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-[var(--color-accent)] text-white text-xs font-semibold rounded-[var(--radius-full)]">
          {badge}
        </span>
      )}

      <div className="flex items-start gap-4">
        {/* Radio circle */}
        <div
          className={`
            shrink-0 w-6 h-6 rounded-full border-2 mt-0.5
            flex items-center justify-center transition-all duration-200
            ${selected
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
              : "border-[var(--color-border)]"
            }
          `}
        >
          {selected && <Check size={14} className="text-white" strokeWidth={3} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon && <span className="shrink-0 text-[var(--color-primary)]">{icon}</span>}
            <span className="font-semibold text-base text-[var(--color-text)]">{label}</span>
          </div>
          {description && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {description}
            </p>
          )}
          {features && features.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {features.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Check size={14} className="text-[var(--color-success)] shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </button>
  );
}
