import React from "react";
import { Smartphone, Globe, Check, ArrowRight } from "lucide-react";

interface PathCardProps {
  path: "app" | "web";
  selected: boolean;
  onSelect: () => void;
}

const pathData = {
  app: {
    icon: Smartphone,
    title: "Download the App",
    subtitle: "Full experience",
    features: [
      "Push & email reminders",
      "Caregiver multi-user tracking",
      "Bulk order recommendations",
      "One-tap reorder",
      "Personalized dashboard",
      "Best discount tiers",
    ],
    badge: "Recommended",
    accentClass: "border-[var(--color-primary)]",
    badgeBg: "bg-[var(--color-primary)]",
  },
  web: {
    icon: Globe,
    title: "Use Web Tracker",
    subtitle: "Quick & simple",
    features: [
      "Email reminders",
      "Simple replacement tracker",
      "Easy reorder link",
    ],
    badge: "No install needed",
    accentClass: "border-[var(--color-accent)]",
    badgeBg: "bg-[var(--color-accent)]",
  },
};

export default function PathCard({ path, selected, onSelect }: PathCardProps) {
  const data = pathData[path];
  const Icon = data.icon;
  const isApp = path === "app";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full text-left rounded-[var(--radius-lg)] border-2 transition-all duration-200
        cursor-pointer relative overflow-hidden
        ${selected
          ? `${data.accentClass} shadow-[var(--shadow-lg)]`
          : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40 shadow-[var(--shadow-card)]"
        }
        ${isApp ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface)]"}
      `}
    >
      {/* Badge */}
      <div className={`${data.badgeBg} text-white text-xs font-semibold py-1.5 px-4 text-center`}>
        {data.badge}
      </div>

      <div className={`${isApp ? "p-6" : "p-5"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-[var(--radius-md)] ${isApp ? "bg-[var(--color-primary)]/10" : "bg-[var(--color-accent)]/10"} flex items-center justify-center`}>
            <Icon size={24} className={isApp ? "text-[var(--color-primary)]" : "text-[var(--color-accent)]"} />
          </div>
          <div>
            <h3 className={`font-bold ${isApp ? "text-lg" : "text-base"} text-[var(--color-text)]`}>{data.title}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{data.subtitle}</p>
          </div>
        </div>

        <ul className="space-y-2.5 mb-5">
          {data.features.map((feat) => (
            <li key={feat} className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]">
              <Check size={16} className="text-[var(--color-success)] shrink-0" />
              {feat}
            </li>
          ))}
        </ul>

        <div className={`
          flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] font-semibold text-sm transition-colors
          ${selected
            ? isApp
              ? "bg-[var(--color-primary)] text-white"
              : "bg-[var(--color-accent)] text-white"
            : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
          }
        `}>
          {isApp ? "Get the App" : "Continue on Web"}
          <ArrowRight size={16} />
        </div>
      </div>
    </button>
  );
}
