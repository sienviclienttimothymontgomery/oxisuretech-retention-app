# OxiSure Tech — UI System (Week 3)

## Overview

This document defines the practical UI system for the OxiSure Tech Retention Platform prototype. It covers design tokens, components, usage patterns, and dark/light mode strategy.

## Design Principles

1. **Calm & Trustworthy** — Medical-grade reliability feel. No flashy animations or trendy gradients.
2. **Readable at a Glance** — Large typography, high contrast, clear status indicators.
3. **Older-User Optimized** — 16px base text, 44px minimum tap targets, explicit labels.
4. **Mobile-First** — All layouts designed at 375px first, scale up.
5. **Conversion-Aware** — Every screen guides the user to one clear next action.

## Color Palette

### Light Mode (Primary)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1B365D` | Buttons, headers, nav, brand elements |
| `--color-primary-light` | `#2A4A7F` | Hover states, secondary emphasis |
| `--color-accent` | `#0EA5E9` | Links, web tracker badge, highlights |
| `--color-success` | `#16A34A` | On-track status, active indicators |
| `--color-warning` | `#D97706` | Due-soon status, soft alerts |
| `--color-danger` | `#DC2626` | Overdue/recovery status, errors |
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-bg-subtle` | `#F8FAFC` | Card backgrounds, subtle containers |
| `--color-text` | `#0F172A` | Primary text |
| `--color-text-secondary` | `#475569` | Descriptions, secondary text |
| `--color-text-muted` | `#94A3B8` | Hints, captions, disabled text |

### Dark Mode (Secondary)
Dark mode uses inverted luminance with the same hue family. It's supported but not the default experience — medical/health context favors light mode.

## Typography

- **Font Family**: Inter (Google Fonts, `display: swap`)
- **Body**: 16px / 1.6 line-height
- **H1**: 2rem (32px) / 700 weight / -0.02em tracking
- **H2**: 1.5rem (24px) / 600 weight
- **H3**: 1.25rem (20px) / 600 weight
- **Small text**: 0.875rem (14px)
- **Caption**: 0.8125rem (13px), muted color

## Spacing & Sizing

- **Page padding**: 20px mobile, 24px tablet+
- **Max content width**: 480px (mobile-optimized container)
- **Minimum tap target**: 44px × 44px (WCAG 2.5.5)
- **Card padding**: 16px (sm), 20px (md), 24px (lg)
- **Section spacing**: 24px between major sections

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Inputs, small buttons, inner elements |
| `--radius-md` | 12px | Cards, panels, buttons |
| `--radius-lg` | 16px | Feature cards, CTA sections |
| `--radius-xl` | 24px | Hero containers |
| `--radius-full` | 9999px | Badges, pills, dots |

## Shadows

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Subtle elevation for inline elements |
| `--shadow-card` | Default card elevation |
| `--shadow-md` | Hover states, elevated cards |
| `--shadow-lg` | Modals, path selection cards |

## Component Inventory

### Button (`@/components/ui/Button.tsx`)
- **Variants**: primary, secondary, ghost, danger, success
- **Sizes**: sm (40px), md (48px), lg (56px)
- **Features**: Icon support, loading spinner, fullWidth option
- **Accessibility**: `disabled` state with opacity, `aria-disabled`

### Card (`@/components/ui/Card.tsx`)
- Surface container with configurable padding, border, and hover lift
- Supports onClick (renders as `<button>`)

### StatusBadge (`@/components/ui/StatusBadge.tsx`)
- States: on-track (green), due-soon (amber), overdue (red), recovery (red pulse), complete (blue)
- Includes animated pulsating dot indicator
- `role="status"` for screen readers

### StepIndicator (`@/components/ui/StepIndicator.tsx`)
- Horizontal step dots with labels
- Animated progress line between steps
- `aria-current="step"` on active step

### DatePanel (`@/components/ui/DatePanel.tsx`)
- Large SVG ring countdown (maps 30 days to full circle)
- Color transitions: green → amber → red
- Central number display with "days left" / "days overdue"

### CTASection (`@/components/ui/CTASection.tsx`)
- Full-width gradient card with discount badge
- Variant backgrounds: primary, accent, success, warning
- High-contrast white text on gradient

### InputField (`@/components/ui/InputField.tsx`)
- Labeled input with error/hint states
- `aria-describedby` for validation messages
- `aria-invalid` on error

### RadioCard (`@/components/ui/RadioCard.tsx`)
- Large tappable cards with `role="radio"` and `aria-checked`
- Optional feature list with checkmarks
- Optional badge (e.g., "Recommended")

### PathCard (`@/components/ui/PathCard.tsx`)
- App vs Web selection cards
- App shows 6 features, Web shows 3
- Visual hierarchy: App is visually dominant

### ProductCard (`@/components/ui/ProductCard.tsx`)
- Product image + name + description
- Optional quantity stepper (±) with labeled buttons
- Optional price display

### CaregiverCard (`@/components/ui/CaregiverCard.tsx`)
- Managed user tile with avatar, name, relationship
- Compact status badge showing days remaining

### SuccessState (`@/components/ui/SuccessState.tsx`)
- Animated check circle with fade-up animation
- Configurable title and message

### EmptyState (`@/components/ui/EmptyState.tsx`)
- No-data placeholder with icon, title, message, optional action

### PrototypeNav (`@/components/ui/PrototypeNav.tsx`)
- Dev-only fixed bottom navigation bar
- Shows all 14 prototype routes for easy demo navigation
- Active route highlighting

## Discount Tier System

The reorder flow uses timed incentive tiers, not subscription language:

| Status | Discount | Label |
|--------|----------|-------|
| Early (on-track) | 10% | "Early Reorder" |
| Due Now (due-soon) | 12% | "Due Now" |
| Overdue | 15% | "Overdue" |
| Recovery | 20% | "Recovery" |

These are displayed as a gradient banner in the reorder flow with the message explaining the timing incentive.

## Route Structure

| Route | Purpose | Path |
|-------|---------|------|
| `/` | QR Landing | Activation |
| `/activate` | Scan Confirmation | Activation |
| `/choose-path` | App vs Web Decision | Activation |
| `/app/welcome` | Welcome | App Onboarding |
| `/app/user-type` | User Type | App Onboarding |
| `/app/confirm-product` | Product Confirm | App Onboarding |
| `/app/quantity` | Quantity | App Onboarding |
| `/app/notifications` | Alerts | App Onboarding |
| `/app/dashboard` | Dashboard | App |
| `/web/start` | Email + Product | Web Onboarding |
| `/web/check-email` | Magic Link | Web Onboarding |
| `/web/dashboard` | Dashboard | Web |
| `/reorder` | Reorder Flow | Shared |
| `/reorder/success` | Success + Reset | Shared |
