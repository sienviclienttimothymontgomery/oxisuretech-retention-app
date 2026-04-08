import React from "react";
import Button from "./Button";

interface CTASectionProps {
  headline: string;
  description?: string;
  buttonLabel: string;
  buttonIcon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "accent" | "success" | "warning";
  discount?: string;
}

const bgStyles = {
  primary: "from-[var(--color-primary)] to-[var(--color-primary-dark)]",
  accent: "from-[var(--color-accent)] to-[var(--color-accent-dark)]",
  success: "from-[var(--color-success)] to-emerald-700",
  warning: "from-[var(--color-warning)] to-amber-700",
};

export default function CTASection({
  headline,
  description,
  buttonLabel,
  buttonIcon,
  onClick,
  href,
  variant = "primary",
  discount,
}: CTASectionProps) {
  const content = (
    <div className={`w-full rounded-[var(--radius-lg)] bg-gradient-to-br ${bgStyles[variant]} p-6 text-center`}>
      {discount && (
        <span className="inline-block mb-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-[var(--radius-full)] text-white text-sm font-semibold">
          {discount}
        </span>
      )}
      <h3 className="text-xl font-bold text-white mb-1">{headline}</h3>
      {description && (
        <p className="text-white/80 text-sm mb-4">{description}</p>
      )}
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        icon={buttonIcon}
        onClick={onClick}
        className="!bg-white !text-[var(--color-primary)] hover:!bg-white/90 !font-bold !shadow-lg"
      >
        {buttonLabel}
      </Button>
    </div>
  );

  if (href) {
    return <a href={href} className="block no-underline">{content}</a>;
  }
  return content;
}
