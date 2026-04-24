# Week 4 Schema Configuration

## Profiles Table
The `profiles` table is initialized directly via `supabase/migrations/20240417000000_init_auth_onboarding.sql`.

### Minimum Web Schema Fields
- `id` (UUID, PK) -> Links to `auth.users.id`
- `email` -> Pulled during the trigger.
- `auth_provider` -> Context of auth.
- `path_type` -> Must be `'web'` or `'app'`. Defines access zones.
- `user_type` -> Self tracking vs Caregiver (`'self'`, `'caregiver'`).
- `product_sku` -> Baseline product tracked.
- `quantity` -> Integer for replacement tracking.
- `onboarding_completed` -> Boolean gatekeeper for dashboard access.
- `created_at` / `updated_at`

### Security (RLS)
Row Level Security is enabled on `profiles`.
- Users can SELECT only their own row `using (auth.uid() = id)`.
- Users can UPDATE only their own row `using (auth.uid() = id)`.
- Users can INSERT only their own row `with check (auth.uid() = id)`.

### Automatic Registration
A Postgres trigger `on_auth_user_created` calls the `handle_new_user()` function automatically to provision exactly one `profiles` row per `auth.users` creation, preventing race conditions or UI-side failures in profile initialization.
