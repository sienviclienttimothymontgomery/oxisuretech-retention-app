# Week 4 Auth Architecture

This document describes the foundational authentication and onboarding architecture for the dual-path OxiSure Tech Retention Platform.

## Core Rules

*   **Provider Validation**: The application primarily delegates validation to Supabase GoTrue via `email`, `apple`, and `google` providers.
*   **Next.js Implementation**: Uses `@supabase/ssr` to securely handle Next.js 16 async `cookies()`.
*   **Dual Path Handling**: 
    *   **App Path**: `/app/*` intended for a native-like experience (richer UI). Flow: Login -> Select Path -> Complete App Onboarding -> Access App Dashboard.
    *   **Web Path**: `/web/*` intended for a Magic Link, lightweight fallback. Flow: Enter Email -> Magic Link Verification -> Lightweight Web Onboarding -> Access Web Dashboard.
*   **Separation of Concerns**: Unauthenticated users visiting a locked route route are redirected. The validation and redirection happen simultaneously on both the Middleware layer (`middleware.ts`) and within Server Components.
*   **Security (RLS)**: The `profiles` schema is used to augment `auth.users`, keeping sensitive onboarding states (such as `product_sku` or `path_type`) protected. Read/write capabilities are limited to the user themselves.

## Next Steps

Later sprints will hook the established session IDs (JWT) into actual notifications and caregiver pipelines. For now, the focus is pure data storage and path routing.
