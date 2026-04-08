# OxiSure Tech — App Navigation Structure

## Overview

This document defines the mobile app navigation architecture for future React Native implementation. The web prototype demonstrates the screen flows; this doc maps them to native navigation patterns.

## Navigation Map

```
Root Navigator (Stack)
├── Auth Stack (unauthenticated)
│   ├── Welcome
│   ├── UserType
│   ├── ConfirmProduct
│   ├── Quantity
│   └── Notifications (permission request)
│
├── Main Tab Navigator (authenticated)
│   ├── Dashboard Tab
│   │   ├── DashboardHome (default)
│   │   └── ProductDetail (modal)
│   │
│   ├── Reorder Tab
│   │   ├── ReorderPrompt (default)
│   │   └── ReorderSuccess (push → replaces stack)
│   │
│   └── Settings Tab
│       ├── SettingsHome
│       ├── NotificationPreferences
│       └── AccountInfo
│
└── Caregiver Stack (modal presentation)
    ├── CaregiverProfileList
    ├── CaregiverProfileDetail
    └── CaregiverAddNew
```

## Navigation Type Recommendations

### Stack Navigator — Onboarding
- **Pattern**: Linear forward-only flow
- **Rationale**: Onboarding is a one-time sequential process. Back navigation is allowed but not encouraged. Each step pushes onto the stack.
- **Transition**: Slide from right (iOS default)
- **Header**: Minimal — logo + step indicator, no visible back button text

### Tab Navigator — Main App
- **Pattern**: Bottom tab bar with 3 tabs
- **Tabs**: Dashboard, Reorder, Settings
- **Rationale**: Three primary actions that users need quick access to. Tab bar stays visible during all main-app screens.
- **Active indicator**: Filled icon + label, primary color
- **Inactive**: Outlined icon + label, muted color

### Modal Stack — Caregiver
- **Pattern**: Full-screen modal presented over tabs
- **Rationale**: Caregiver management is a secondary workflow. Presenting as a modal keeps the user's mental model of "I'm managing someone else's tracker" separate from their own dashboard.
- **Transition**: Slide up from bottom
- **Dismiss**: Swipe down or explicit close button

## Route Definitions

| Route Name | Navigator | Screen Type | Notes |
|------------|-----------|-------------|-------|
| `welcome` | Auth Stack | Screen | Entry point, no back |
| `user-type` | Auth Stack | Screen | Self vs Caregiver |
| `confirm-product` | Auth Stack | Screen | Product confirmation |
| `quantity` | Auth Stack | Screen | Quantity selector |
| `notifications` | Auth Stack | Screen | OS permission prompt |
| `dashboard` | Main Tabs | Tab Screen | Primary view, countdown ring |
| `product-detail` | Dashboard Stack | Modal | Product info, swap product |
| `reorder` | Main Tabs | Tab Screen | Reorder prompt + checkout |
| `reorder-success` | Reorder Stack | Screen | Reset confirmation |
| `settings` | Main Tabs | Tab Screen | Preferences |
| `caregiver-profile-list` | Caregiver Modal | Screen | Managed users list |
| `caregiver-profile-detail` | Caregiver Modal | Screen | Individual tracker |
| `caregiver-add-new` | Caregiver Modal | Screen | Add managed user |

## Deep Linking

For QR code activation flow:
- `oxisure://activate?product_id=XXX` → Opens app, triggers onboarding if not complete
- `oxisure://reorder` → Opens reorder tab directly
- `oxisure://dashboard` → Opens dashboard

Fallback: Universal Links via `https://app.oxisuretech.com/activate`

## State Management Notes

- Onboarding completion stored locally (AsyncStorage) + synced to backend
- Current nav state should persist across app restarts (React Navigation state persistence)
- Tab badge on Reorder tab when replacement is due-soon or overdue
- Caregiver list accessible from dashboard via "People I Manage" toggle/button

## React Native Implementation Notes

- Use `@react-navigation/native` v7+
- Stack: `@react-navigation/stack` (native stack for performance)
- Tabs: `@react-navigation/bottom-tabs`
- Safe area handling: `react-native-safe-area-context`
- Screen options should disable gestures on onboarding to prevent accidental back-swipe
- Tab bar height: 83px (includes safe area on iPhone)
- All transitions should use native driver for 60fps
