import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; /* 0-indexed */
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress" className="w-full mb-8">
      <ol className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[var(--color-border)]" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-[var(--color-primary)] transition-all duration-500"
          style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 48px)` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li
              key={step}
              className="flex flex-col items-center relative z-10"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-[var(--color-primary)] text-white"
                    : isCurrent
                    ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-accent)]/20"
                    : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                  }
                `}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium text-center max-w-[60px] leading-tight
                  ${isCurrent ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}
                `}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
