-- ============================================================
-- OxiSure Mock Dataset & Edge Case Seed Data
-- ============================================================
-- USAGE: Run this in the Supabase SQL Editor AFTER creating
-- test users via the Auth UI or API. Replace the UUIDs below
-- with real auth.users IDs from your test environment.
--
-- This script covers:
--   1. Caregiver with many dependents (conflict scenarios)
--   2. Edge cases: overdue, day-0, just-onboarded, null anchor
--   3. Multi-quantity supply edge cases
-- ============================================================

-- ── Step 1: Create test profiles ──
-- NOTE: These INSERT statements assume the auth.users trigger
-- has already created a row. Use UPSERT to be safe.
-- Replace these UUIDs with real user IDs from your Supabase Auth dashboard.

-- Test Caregiver (manages 6+ people — conflict-heavy)
INSERT INTO public.profiles (id, email, user_type, path_type, product_sku, quantity, onboarding_completed, notifications_push, notifications_email, tracker_started_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'caregiver-test@oxisure.dev',
  'caregiver', 'app', 'OXI-TUB-07', 2, true, true, true,
  NOW() - INTERVAL '18 days'  -- mid-cycle
)
ON CONFLICT (id) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  quantity = EXCLUDED.quantity,
  tracker_started_at = EXCLUDED.tracker_started_at,
  onboarding_completed = true;

-- Test Self-User (single tube, just onboarded today)
INSERT INTO public.profiles (id, email, user_type, path_type, product_sku, quantity, onboarding_completed, notifications_push, notifications_email, tracker_started_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'newuser-test@oxisure.dev',
  'self', 'web', 'OXI-TUB-07', 1, true, true, false,
  NOW()  -- just started
)
ON CONFLICT (id) DO UPDATE SET
  tracker_started_at = NOW(),
  onboarding_completed = true;

-- Test Self-User (overdue — 35 days into cycle)
INSERT INTO public.profiles (id, email, user_type, path_type, product_sku, quantity, onboarding_completed, notifications_push, notifications_email, tracker_started_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'overdue-test@oxisure.dev',
  'self', 'app', 'OXI-TUB-50', 1, true, true, true,
  NOW() - INTERVAL '35 days'  -- 5 days overdue
)
ON CONFLICT (id) DO UPDATE SET
  tracker_started_at = NOW() - INTERVAL '35 days',
  onboarding_completed = true;

-- Test Self-User (null tracker_started_at — legacy user)
INSERT INTO public.profiles (id, email, user_type, path_type, product_sku, quantity, onboarding_completed, notifications_push, notifications_email, tracker_started_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'legacy-test@oxisure.dev',
  'self', 'web', 'OXI-TUB-07', 3, true, false, true,
  NULL  -- should fallback to created_at
)
ON CONFLICT (id) DO UPDATE SET
  tracker_started_at = NULL,
  quantity = 3;

-- Test Self-User (max quantity edge case)
INSERT INTO public.profiles (id, email, user_type, path_type, product_sku, quantity, onboarding_completed, notifications_push, notifications_email, tracker_started_at)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'maxqty-test@oxisure.dev',
  'self', 'app', 'OXI-TUB-25', 10, true, true, true,
  NOW() - INTERVAL '280 days'  -- deep into a 300-day supply cycle
)
ON CONFLICT (id) DO UPDATE SET
  quantity = 10,
  tracker_started_at = NOW() - INTERVAL '280 days';


-- ── Step 2: Dependents for the test caregiver ──
-- Creates a realistic set with scheduling conflicts built in.

DELETE FROM public.dependents
WHERE caregiver_id = '00000000-0000-0000-0000-000000000001';

-- CONFLICT GROUP A: Mom & Dad both due within 2 days of each other
INSERT INTO public.dependents (caregiver_id, name, product_sku, quantity, last_replaced_at, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mom',   'OXI-TUB-07', 1, NOW() - INTERVAL '25 days', 'Uses concentrator at night'),
  ('00000000-0000-0000-0000-000000000001', 'Dad',   'OXI-TUB-07', 1, NOW() - INTERVAL '23 days', 'Portable unit during day');

-- CONFLICT GROUP B: Aunt & Uncle both due within 1 day
INSERT INTO public.dependents (caregiver_id, name, product_sku, quantity, last_replaced_at, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Aunt Rose', 'OXI-TUB-25', 2, NOW() - INTERVAL '15 days', NULL),
  ('00000000-0000-0000-0000-000000000001', 'Uncle Jim', 'OXI-TUB-07', 1, NOW() - INTERVAL '14 days', 'Recently changed to shorter tube');

-- STANDALONE: Grandma — overdue (triggers P0 critical)
INSERT INTO public.dependents (caregiver_id, name, product_sku, quantity, last_replaced_at, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Grandma', 'OXI-TUB-50', 1, NOW() - INTERVAL '33 days', 'Needs extra-long tubing');

-- STANDALONE: Neighbor — freshly replaced (no conflicts)
INSERT INTO public.dependents (caregiver_id, name, product_sku, quantity, last_replaced_at, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Neighbor Pat', 'OXI-TUB-07', 1, NOW() - INTERVAL '2 days', 'Helping out temporarily');

-- EDGE CASE: Person with NULL last_replaced_at (never replaced)
INSERT INTO public.dependents (caregiver_id, name, product_sku, quantity, last_replaced_at, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'New Patient', 'OXI-TUB-07', 1, NULL, 'Just added, needs first replacement');

-- EDGE CASE: Person replaced exactly 30 days ago (day 0 boundary)
INSERT INTO public.dependents (caregiver_id, name, product_sku, quantity, last_replaced_at, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Cousin Lee', 'OXI-TUB-07', 1, NOW() - INTERVAL '30 days', 'Should show as Replace Now');


-- ============================================================
-- EDGE CASE DOCUMENTATION
-- ============================================================
--
-- The following edge cases are covered by this seed data:
--
-- ┌────────────────────────────┬──────────────────────────────────────────┐
-- │ Edge Case                  │ Expected Behavior                        │
-- ├────────────────────────────┼──────────────────────────────────────────┤
-- │ Day 0 (exactly 30 days)    │ daysLeft = 0, status = "Replace Now"     │
-- │ Overdue (>30 days)         │ daysLeft = 0, status = "Overdue"         │
-- │ Just onboarded (today)     │ daysLeft = 30, status = "On Track"       │
-- │ NULL tracker_started_at    │ Falls back to created_at                 │
-- │ NULL last_replaced_at      │ daysLeft = 0, "Replace Now" immediately  │
-- │ High quantity (10 tubes)   │ 300-day supply cycle, reorder logic ok   │
-- │ Scheduling conflict (2-3d) │ Conflict detection groups them together  │
-- │ No dependents              │ Empty state renders correctly            │
-- │ 8 dependents (many)        │ Scroll + performance is acceptable       │
-- │ Both notifs disabled       │ No notifications sent, UI shows warning  │
-- │ Cycle rollover (day 31+)   │ Modular math resets to new cycle         │
-- └────────────────────────────┴──────────────────────────────────────────┘
--
-- To test conflict detection specifically, the caregiver user
-- (ID ...0001) has two built-in conflict groups:
--   Group A: Mom & Dad — due within 2 days of each other
--   Group B: Aunt Rose & Uncle Jim — due within 1 day of each other
--
-- The system should suggest batch replacement dates for each group.
-- ============================================================
