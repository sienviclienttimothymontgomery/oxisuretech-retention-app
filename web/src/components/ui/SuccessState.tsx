import React from "react";
import { CheckCircle } from "lucide-react";

interface SuccessStateProps {
  title: string;
  message: string;
  children?: React.ReactNode;
}

export default function SuccessState({ title, message, children }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 animate-fade-up">
      <div className="w-20 h-20 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mb-6">
        <CheckCircle
          size={48}
          className="text-[var(--color-success)] animate-check"
        />
      </div>
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">{title}</h2>
      <p className="text-base text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
        {message}
      </p>
      {children && <div className="mt-8 w-full">{children}</div>}
    </div>
  );
}
