-- Migration: Add order_id column to profiles
-- This column stores the store order ID entered during onboarding.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS order_id TEXT;
