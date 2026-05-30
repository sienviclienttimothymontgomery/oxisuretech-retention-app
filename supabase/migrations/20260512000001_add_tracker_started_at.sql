-- Migration: Add tracker_started_at to profiles
-- This column tracks when the user's current 30-day replacement cycle started.
-- Previously we used created_at which would reset the tracker calculation
-- whenever the profile was re-fetched after navigating (e.g. visiting Settings).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tracker_started_at TIMESTAMPTZ;

-- Backfill: set tracker_started_at to created_at for existing users who have
-- completed onboarding (so their existing cycle is preserved).
UPDATE public.profiles
SET tracker_started_at = created_at
WHERE onboarding_completed = true
  AND tracker_started_at IS NULL;
