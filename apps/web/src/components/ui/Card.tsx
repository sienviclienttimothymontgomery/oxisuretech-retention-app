import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
  bordered?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className = "",
  padding = "md",
  hoverable = false,
  bordered = false,
  onClick,
  style,
}: CardProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      style={style}
      className={`
        rounded-[var(--radius-md)] bg-[var(--color-surface)]
        shadow-[var(--shadow-card)]
        ${paddings[padding]}
        ${bordered ? "border border-[var(--color-border)]" : ""}
        ${hoverable ? "hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : ""}
        ${onClick ? "w-full text-left" : ""}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}
