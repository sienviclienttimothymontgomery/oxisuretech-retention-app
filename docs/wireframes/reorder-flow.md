# Wireframe Reference: Reorder Flow

## Purpose
Create a fast, friction-free checkout handoff that leverages timed discounts to drive conversion, rather than traditional subscription auto-billing.

## Screens & States

### 1. Reorder Review (`/reorder`)
- **Action**: Review order, adjust quantity, proceed to checkout.
- **State**: Draft order overview.
- **Discount Banner**: Changes based on timing:
  - 10% (Early Reorder)
  - 12% (Due Now)
  - 15% (Overdue)
  - 20% (Recovery)
- **Component**: `ProductCard` with inline quantity stepper matching the onboarding choices.
- **Order Summary**: Subtotal, line-item Discount amount in green, Total.
- **CTA**: "Proceed to Checkout" (external link icon).
- **Engineering Note**: Clicking "Proceed to checkout" should generate a Shopify cart permalink with the correct variant ID, quantity, and auto-applied discount code, passing the user out of the app.

### 2. Reorder Success (`/reorder/success`)
- **Action**: Acknowledge reset, return to dashboard.
- **State**: Post-purchase confirmation.
- **Component**: `SuccessState` with animated checkmark.
- **Lifecycle Reset Summary**:
  - "New replacement date" (e.g., today + 30 days)
  - "Days until next change" (30 days)
  - "Quantity ordered"
- **CTA**: "Go to Dashboard"
- **Engineering Note**: Eventually, this will be triggered by a Shopify webhook hitting our backend, confirming the order and resetting the lifecycle record, rather than a direct client-side redirect.

## Navigation flow
Dashboard -> Reorder Review -> (External Checkout) -> Reorder Success
