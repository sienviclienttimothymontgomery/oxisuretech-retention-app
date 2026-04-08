# Wireframe Reference: App Dashboard

## Purpose
The primary hub for users checking their tubing status, responding to reminders, and managing their settings or dependents.

## Core Elements & States

### 1. Status Ring (Date Panel)
- **Action**: Passive information view.
- **State**: Circular SVG ring that fills/depletes based on days remaining in the 30-day cycle.
- **Status Colors**:
  - Green ("On Track", >7 days left)
  - Amber ("Due Soon", 1-7 days left)
  - Red ("Overdue", <=0 days left)
- **Hierarchy 1**: Instantly scannable "days left" number.

### 2. View Toggle (Self vs Caregiver)
- **Action**: Switch context between personal tracker and managed users.
- **State**: Segmented control. Only visible if user indicated they are a caregiver during onboarding.
- **Copy**: "My Tracker" / "People I Manage"

### 3. Reorder CTA
- **Action**: Initiate the reorder flow.
- **State**: High-contrast gradient card. Dynamic copy based on current discount tier.
- **Copy**: "Ready to Reorder?" / "10% Off — Early Reorder"
- **Hierarchy 1**: The most prominent button on the page.

### 4. Details Cards
- **Elements**: Product Summary, Reminder Settings active state, Future bulk recommendations placeholder.
- **Action**: Tap to open deeper settings modals (future sprint).

## Caregiver State Variations
When the user toggles to "People I Manage":
- The main ring is hidden.
- Replaced by a list of `CaregiverCard` components.
- Each card shows a dependent's name, relationship, and individual mini-status badge.
- Floating Action Button or bottom CTA to "Add Another Person".

## Engineering Notes
In production, this view requires real-time fetching from `user_supplies` tables, calculating localized date diffs, and syncing with the current discount tier logic.
