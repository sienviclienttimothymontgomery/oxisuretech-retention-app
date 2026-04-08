# Wireframe Reference: Web Tracker

## Purpose
A simplified, lightweight version of the dashboard for web-only users. Strips away caregiver logic and push notifications in favor of pure utility.

## Screens & States

### 1. Web Dashboard (`/web/dashboard`)
- **Action**: Check status, reorder.
- **State**: Authenticated (via magic link cookie).
- **Copy**: "Your Tubing Tracker" / "Simple. No guesswork."
- **Status Ring**: Exact same circular logic and components as the App Dashboard.
- **Reorder CTA**: Exact same component and discount logic as the App Dashboard.
- **Reminders**: Shows only "Email reminders active". No push notification reference.
- **Upsell Nudge**: "Want more features? Download the app..."
  - **Action**: Native link to App Store / Play Store.

## Key UX Differences from App
- No caregiver management features.
- No push notification settings.
- Explicit "Web Tracker" badge in the header to remind them of the context.
- Intentional, gentle friction to upgrade to the app experience.

## Engineering Notes
Since web sessions expire or get cleared, the tracker relies on magic links. The reorder email reminders will include a magic-link enabled URL that drops them directly back into this authenticated dashboard.
