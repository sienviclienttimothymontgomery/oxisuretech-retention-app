-- Migration: Add dependents table for caregiver management
-- Run this in the Supabase SQL Editor

-- 1. Create the dependents table
CREATE TABLE public.dependents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  product_sku TEXT DEFAULT 'OXI-TUB-07',
  quantity INTEGER DEFAULT 1,
  last_replaced_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.dependents ENABLE ROW LEVEL SECURITY;

-- 3. Caregivers can only see/manage their own dependents
CREATE POLICY "Caregivers manage own dependents"
  ON public.dependents FOR ALL
  USING (caregiver_id = auth.uid());

-- 4. Admins can view all dependents
CREATE POLICY "Admins view all dependents"
  ON public.dependents FOR SELECT
  USING (public.is_admin());
