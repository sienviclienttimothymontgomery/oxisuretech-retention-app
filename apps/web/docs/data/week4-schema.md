# Week 4 Data Schema

The following baseline schema is deployed for Week 4:

## `profiles`
The `profiles` table maps 1:1 with `auth.users` via a Supabase trigger. It acts as the secure persistence layer for onboarding state and dual-path attributes.

*   `id` (`uuid`, PRIMARY KEY, REFERENCES `auth.users`)
*   `email` (`text`, copied over at creation)
*   `auth_provider` (`text`, optionally set by UI triggers or server logic)
*   `path_type` (`text` constraint: `app` or `web`)
*   `user_type` (`text` constraint: `self` or `caregiver`)
*   `product_sku` (`text`, nullable)
*   `quantity` (`integer`, default `1`)
*   `onboarding_completed` (`boolean`, default `false`)
*   `created_at` (`timestamptz`, default `now()`)
*   `updated_at` (`timestamptz`, default `now()`)

### Deferred logic
Caregiver mappings (such as `dependent_id`), notification preferences (schedules), and detailed subscription state are reserved for Week 5+.

### Security
Row-Level Security (RLS) is enabled. Users can only select and update rows where `id = auth.uid()`. No delete operations are permitted.
