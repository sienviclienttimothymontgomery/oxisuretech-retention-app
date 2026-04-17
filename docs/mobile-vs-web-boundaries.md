# Mobile vs Web Boundaries

This document outlines the product separation between the OxiSure Tech Web Tracker and the Mobile App.

## General Philosophy
1. **Web Tracker (`apps/web`)**: Focused on a lightweight, no-install onboarding and progress checking experience. It utilizes magic links to authenticate and reduces barriers to entry for individuals trying the product.
2. **Mobile App (`apps/mobile`)**: A persistent, native application built via Expo/React Native. Targets users wanting push notifications (e.g., daily tracking reminders), more continuous engagement, and caregiver capabilities.

## Architecture Guidelines
- **Authentication**: 
  - Web uses `@supabase/ssr` with Next.js Server Components.
  - Mobile uses standard `@supabase/supabase-js` configured for React Native `AsyncStorage`.
- **UI Components**: UI components do not currently share a cross-platform layer. Next.js components live in `apps/web/src/components` and Expo components live in `apps/mobile/components`.
- **Shared API**: Data access structures and validations belong in `packages/core` to ensure identical API handling across boundaries.
