# Client UI Approval Package — Week 3

## For: OxiSure Tech Stakeholders
## Prepared by: Development Team
## Date: April 2026

---

## What This Package Contains

A **fully clickable prototype** of the OxiSure Tech Retention Platform, running in a web browser. You can step through every user flow as if it were the real app and web tracker.

### How to Review

1. Open the prototype in your browser at the provided URL
2. Use the **navigation bar at the bottom of the screen** to jump between any screen
3. Click buttons and links — they navigate between screens like the real product
4. Use the **demo switcher** on the reorder page to preview all discount tier scenarios

---

## What Users Will Experience

### Step 1: QR Scan → Landing Page
After purchasing OxiSure oxygen tubing on Amazon, the customer finds a QR code on the product insert. Scanning it opens a mobile-optimized landing page that:
- Explains the value (replacement tracking + reminders + reorder savings)
- Shows the detected product
- Invites setup in under 2 minutes

### Step 2: Choose Your Path
The customer chooses between:
- **App** (Recommended): Full experience with push notifications, caregiver support, and best discounts
- **Web Tracker**: Quick setup via email, no app install, simpler experience

The app path is visually promoted as the higher-value option.

### Step 3a: App Onboarding (5 quick steps)
1. **Welcome** — Sets expectations ("~1 minute setup")
2. **User Type** — "Just for me" or "I'm a caregiver"
3. **Confirm Product** — Shows detected purchase with 30-day cycle info
4. **Quantity** — How many tubes per cycle
5. **Notifications** — Toggle push and email reminders

### Step 3b: Web Tracker Setup (2 steps)
1. **Email + Product** — Enter email, confirm product and quantity on one page
2. **Check Email** — Magic link sent, click to access dashboard

### Step 4: Dashboard
**App Dashboard** shows:
- Large countdown ring (days until replacement)
- Color-coded status (green = on track, amber = due soon, red = overdue)
- Reorder button with current discount tier
- Product summary
- Caregiver toggle to view managed users

**Web Dashboard** shows:
- Same countdown and status
- Simpler layout, email reminders only
- Gentle upgrade prompt to the app

### Step 5: Reorder
When it's time to replace:
- Product is pre-selected from the tracker
- Discount is automatically applied based on timing:
  - 10% for early reorders
  - 12% when due
  - 15% when overdue
  - 20% for recovery (been too long)
- One button takes them to the secure checkout

### Step 6: Success + Reset
After ordering:
- Confirmation screen shows the new 30-day cycle start date
- Countdown automatically resets
- User returns to dashboard with a fresh cycle

---

## Design Decisions for Your Review

### 1. Visual Style
- **Clean, calm, trustworthy** — no flashy animations or trendy effects
- Deep navy brand color with teal accents
- High-contrast text for readability
- Large buttons and text optimized for older users

### 2. Discount Messaging
- **No subscription language** — discounts are framed as timed reorder incentives
- Discounts escalate the longer the customer waits, creating urgency without pressure
- Messaging: "10% Off — Early Reorder" (not "Subscribe & Save")

### 3. Path Differentiation
- The app is marketed as the full, premium experience
- The web tracker is the quick, no-install fallback
- Users can upgrade from web to app at any time

### 4. Caregiver Support
- Available in the app path only
- Caregivers can manage replacements for multiple people
- Each managed user has their own status and countdown

---

## What Is NOT in This Prototype

This is a **design and flow prototype only**. The following are intentionally deferred:

| Capability | Status | Target |
|-----------|--------|--------|
| Real user accounts | Placeholder | Week 4–5 |
| Shopify checkout integration | Placeholder link | Week 5–6 |
| Push notifications | Toggle only | Week 6 |
| Email reminders | Not sent | Week 5–6 |
| QR code scanning | Manual entry | Week 4 |
| Amazon order detection | Simulated | Week 6+ |

---

## Questions for Your Feedback

1. **Does the landing page communicate value quickly enough?** Would you change the headline or feature list?
2. **Is the path selection clear?** Do you feel confident that most users will understand the app vs. web choice?
3. **Is the discount messaging appropriate?** Are the 10%/12%/15%/20% tiers aligned with your margin strategy?
4. **Is the caregiver flow useful for your customer base?** Should it be expanded or simplified?
5. **Any copy changes needed?** The current copy is directional — we can refine specific wording.

---

## Next Steps

Upon approval:
1. Begin backend integration (user accounts, real data)
2. Connect Shopify checkout flow
3. Build email notification templates
4. Start React Native mobile app development
5. Set up QR code generation and product insert design
