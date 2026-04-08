# Usability Review — Week 3

## Scope
Review of all prototype flows for usability, with particular attention to older users, caregivers, and users with limited tech familiarity.

## Target User Profile
- **Primary**: Adults 50–80+ who use continuous oxygen therapy
- **Secondary**: Caregivers (family members, home health aides) managing supplies for 1–3 people
- **Tech comfort**: Low to moderate. Many use smartphones but prefer simple, direct interfaces.
- **Physical considerations**: May have reduced vision, limited dexterity, or cognitive fatigue

## Overall Assessment

| Criteria | Rating | Notes |
|----------|--------|-------|
| Onboarding speed | ✅ Excellent | App: 5 steps, ~60 seconds. Web: 2 steps, ~30 seconds. |
| Reading load | ✅ Good | Short sentences, clear headings, no jargon |
| CTA clarity | ✅ Excellent | One primary action per screen, always visible |
| Navigation confidence | ✅ Good | User always knows what step they're on and where to go next |
| Error recovery | ⚠️ Adequate | Forms show errors but no undo/confirmation dialogs in prototype |
| Cognitive load | ✅ Low | Minimal choices per screen, no information overload |

## Flow-by-Flow Analysis

### 1. QR Landing (`/`)
- **Clarity**: ✅ Headline immediately communicates value
- **Reading load**: 4 bullet points, each 6–8 words — excellent for scanning
- **CTA**: Single "Get Started" button, large and prominent
- **Concern**: None. Flow is direct.

### 2. Activation (`/activate`)
- **Clarity**: ✅ "Product Detected" with green checkmark creates trust
- **Information**: Shows product name, description, and replacement cycle
- **CTA**: "Set Up My Tracker" is action-oriented
- **Subtlety**: "Takes less than 2 minutes" sets time expectation — reduces abandonment anxiety

### 3. Path Selection (`/choose-path`)
- **Decision clarity**: ✅ App card is visually dominant (larger, more features, "Recommended" badge)
- **Feature differentiation**: App shows 6 checkmarked features, Web shows 3 — the value gap is immediately obvious
- **Reassurance**: "You can always switch to the app later" reduces web-path commitment anxiety
- **Concern**: Ensure "or" divider between cards is visible enough for low-vision users

### 4. App Onboarding (5 screens)
- **Step indicator**: Always visible, shows progress. Users know where they are.
- **User Type screen**: Two clear options with icons and descriptions. No ambiguity.
- **Product Confirm**: Shows detected product with "Yes, This Is Correct" — reduces cognitive load vs. a search/selection UI.
- **Quantity**: Large stepper (56px buttons) with prominent number display. Easy to use even with reduced dexterity.
- **Notifications**: Toggle switches with clear labels. Warning message if both disabled — prevents accidental opt-out.
- **Speed**: 5 taps to complete. No typing required. Fastest possible onboarding.

### 5. Web Onboarding (2 screens)
- **Simplicity**: ✅ Single-page setup with email + product on the same screen
- **Magic link concept**: Check-email page explains the process in 3 numbered steps — reduces confusion for users unfamiliar with magic links
- **Concern**: Users over 70 may not understand "magic link." Consider adding: "We'll send you a special link — just click it to sign in. No password needed."

### 6. App Dashboard
- **At-a-glance readability**: ✅ Large countdown ring with big number is immediately understandable
- **Status communication**: Color-coded ring (green/amber/red) + text badge — redundant signaling for accessibility
- **Reorder CTA**: Full-width gradient card with discount — impossible to miss
- **Caregiver toggle**: Segmented control at top for "My Tracker" vs "People I Manage" — clear mental model
- **Concern**: Caregiver view shows managed users but no aggregate "urgent items" summary. Consider adding a red-dot count.

### 7. Web Dashboard
- **Simplicity**: ✅ Intentionally simpler than app — fewer sections, no caregiver
- **Upgrade nudge**: Tasteful card suggesting app download — not aggressive
- **Reminder status**: Shows email-only reminders are active — sets expectations

### 8. Reorder Flow
- **Discount visibility**: ✅ Gradient banner with percentage is the first thing users see
- **Pricing transparency**: Subtotal, discount amount, and total are clearly separated
- **Product preselection**: Product is pre-filled from tracker — no re-entry needed
- **Shopify handoff**: "You'll be taken to our secure store" — sets expectation that clicking will leave the app
- **Demo toggle**: Prototype includes tier switcher to demo all 4 discount levels — excellent for approval reviews

### 9. Reorder Success
- **Confirmation**: ✅ Animated checkmark with "Order Placed!" — high confidence
- **Lifecycle reset**: Shows new replacement date, days until next change, and quantity — closes the loop
- **Next action**: "Go to Dashboard" button returns user to main view

## Older-User Specific Observations

### Typography
- ✅ Body text is 16px (never smaller for important content)
- ✅ Headings are 20–32px
- ✅ High contrast (17:1 ratio for body text)
- ⚠️ Caption text (13px) used only for non-essential supplementary info

### Touch Targets
- ✅ All primary buttons are 48px+ height
- ✅ Radio cards are large enough for confident tapping
- ⚠️ Product card quantity steppers in the compact view are 40px — borderline

### Language
- ✅ Short, direct sentences throughout
- ✅ No technical jargon (no "API," "sync," "UUID")
- ✅ Action verbs on all buttons ("Get Started," "Continue," "Reorder Now")
- ⚠️ "Magic link" terminology may confuse some users — add explanatory text

### Navigation
- ✅ One primary action per screen — user never wonders what to do next
- ✅ Step indicators on onboarding prevent "how much more?" anxiety
- ✅ Dashboard is the home base — everything returns here

## Recommendations for Week 4+

1. **Magic link explanation**: Add "No password needed — just click the link we send" to the check-email page
2. **Caregiver dashboard urgency**: Add aggregate alert count on caregiver toggle
3. **Quantity stepper**: Increase compact stepper to 44px minimum
4. **Confirmation dialogs**: Add "Are you sure?" before reorder checkout in production
5. **Help/FAQ access**: Add a small help icon on dashboard for common questions
6. **Font scaling**: Test with OS-level font scaling (150%, 200%) for vision-impaired users
