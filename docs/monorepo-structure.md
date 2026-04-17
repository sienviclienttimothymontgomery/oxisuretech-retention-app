# Monorepo Structure

OxiSure Tech Retention App is now structured as an npm workspaces monorepo. This allows us to share configuration, types, and core logic between the Web and Mobile applications while maintaining clear architecture.

## Overview

```text
oxisuretech-retention-app/
├── apps/
│   ├── web/        # Next.js Web Tracker application
│   └── mobile/     # Expo / React Native Mobile application
├── packages/
│   ├── core/       # Shared business logic and utilities
│   └── types/      # Shared TypeScript definition files
├── supabase/       # Centralized backend, migrations, and edge functions
├── docs/           # Architecture and technical documentation
└── package.json    # Root npm workspaces config
```

## Workspaces
The root `package.json` configures `apps/*` and `packages/*`. 
To install dependencies for all applications simultaneously, navigate to the root directory and run `npm install`.

We use `@oxisuretech/types` and `@oxisuretech/core` to import shared dependencies locally.
