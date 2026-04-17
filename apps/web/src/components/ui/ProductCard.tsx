import React from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";

interface ProductCardProps {
  name: string;
  description?: string;
  imageSrc?: string;
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
  showQuantity?: boolean;
  price?: string;
  selected?: boolean;
}

export default function ProductCard({
  name,
  description,
  imageSrc = "/product-tubing.png",
  quantity = 1,
  onQuantityChange,
  showQuantity = false,
  price,
  selected,
}: ProductCardProps) {
  return (
    <div
      className={`
        rounded-[var(--radius-md)] bg-[var(--color-surface)] p-4
        border transition-all duration-200
        ${selected !== undefined
          ? selected
            ? "border-[var(--color-primary)] shadow-[var(--shadow-md)]"
            : "border-[var(--color-border)]"
          : "border-[var(--color-border)] shadow-[var(--shadow-card)]"
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-20 h-20 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] flex items-center justify-center overflow-hidden">
          <Image
            src={imageSrc}
            alt={name}
            width={72}
            height={72}
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[var(--color-text)] text-base leading-tight">{name}</h4>
          {description && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{description}</p>
          )}
          {price && (
            <p className="text-sm font-semibold text-[var(--color-primary)] mt-1">{price}</p>
          )}
        </div>
      </div>

      {showQuantity && onQuantityChange && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold text-lg text-[var(--color-text)]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
