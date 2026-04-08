import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function InputField({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-[var(--radius-md)]
          bg-[var(--color-bg-subtle)] border
          text-[var(--color-text)] text-base
          placeholder:text-[var(--color-text-muted)]
          transition-colors duration-200
          ${error
            ? "border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/20"
            : "border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          }
          focus:outline-none
        `}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}
