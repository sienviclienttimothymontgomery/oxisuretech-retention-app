# Internal Design Approval — Week 3

## Sprint Summary

Week 3 transformed the Week 2 wireframe concepts into a **14-screen clickable prototype** running in Next.js with Tailwind CSS, Radix UI primitives, and Lucide React icons. All flows are navigable end-to-end in a browser.

## What Changed from Week 2

| Item | Week 2 | Week 3 |
|------|--------|--------|
| Screens | Wireframe concepts (docs only) | 14 high-fidelity coded screens |
| Navigation | Route map in docs | Clickable prototype with proto nav bar |
| Design system | Not defined | Full token system + 14 reusable components |
| Discount model | Not specified | Timed reorder incentives (10/12/15/20%) |
| Caregiver flow | Conceptual | Interactive toggle in app dashboard |
| Web tracker | Conceptual | Full 3-screen flow with magic link |

## Major UX Decisions Made

### 1. Path Selection is a Conversion Page, Not a Feature Comparison
The `/choose-path` screen uses visual hierarchy to nudge app adoption:
- App card: 6 features, "Recommended" badge, larger treatment
- Web card: 3 features, "No install needed" badge, simpler treatment
- Clear "or" divider prevents choice paralysis

**Rationale**: The app path has 3× higher lifetime value. Visual dominance drives the conversion without restricting choice.

### 2. Timed Discount Tiers Replace Subscription Language
Per client direction, no "Subscribe & Save" messaging. Instead:

| Timing | Discount | Psychology |
|--------|----------|------------|
| Early (before due) | 10% | Reward proactive behavior |
| Due now | 12% | Urgency without pressure |
| Overdue | 15% | Gentle recovery incentive |
| Recovery (14+ days late) | 20% | Maximum incentive to re-engage |

**Rationale**: Escalating discounts create urgency through timing psychology, not subscription lock-in. Feels helpful, not salesy.

### 3. Dashboard Uses Ring Countdown, Not Progress Bar
The date panel uses a circular SVG ring that depletes as the replacement date approaches. Color transitions from green → amber → red.

**Rationale**: Ring countdowns are more glanceable than linear bars. The large central number (e.g., "12") is readable from arm's length — important for users who may hold their phone further away.

### 4. Caregiver Is a Modal Overlay, Not a Separate App
Caregivers toggle between "My Tracker" and "People I Manage" via a segmented control on the same dashboard. Individual user detail opens from the list.

**Rationale**: Caregivers need quick context switching. A separate navigation tree would add cognitive overhead. The modal pattern in the future React Native build will keep the mental model clean.

### 5. Web Tracker Is Intentionally Minimal
The web path has:
- No user-type selection (assumed individual)
- No push notifications (email only)
- No caregiver management
- A persistent "Want more features?" upgrade nudge

**Rationale**: The web tracker should feel like a stepping stone to the app, not a complete alternative. Minimal feature set creates natural upgrade pressure.

## Flows Ready for Approval

| # | Flow | Screens | Status |
|---|------|---------|--------|
| 1 | QR Landing → Path Choice | 3 screens | ✅ Ready |
| 2 | App Onboarding → Dashboard | 6 screens | ✅ Ready |
| 3 | Web Onboarding → Dashboard | 3 screens | ✅ Ready |
| 4 | Reorder → Success | 2 screens | ✅ Ready |
| 5 | Caregiver Preview | Dashboard toggle | ✅ Ready |

## Open Questions

1. **App store strategy**: When the React Native build begins, should we use Expo Go for internal testing or native builds from the start?
2. **Discount code format**: Will Shopify discount codes be auto-generated per user, or will there be a fixed set of codes for each tier?
3. **Caregiver limit**: Is there a max number of managed users? The current prototype shows 3.
4. **Product catalog**: Will there be multiple SKUs beyond the standard 7ft tubing, or is this a single-product system?

## Intentionally Deferred to Week 4+

- [ ] Supabase auth integration (real magic links, user sessions)
- [ ] Shopify checkout integration (real product handoff)
- [ ] Push notification backend (Firebase Cloud Messaging)
- [ ] Product detection from QR/Amazon order data
- [ ] Real-time status calculation based on actual order dates
- [ ] Dark mode polish and testing
- [ ] Email template design (reminder emails)
- [ ] Analytics and conversion tracking
- [ ] Error boundary and offline handling
