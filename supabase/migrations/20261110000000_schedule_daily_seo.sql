-- Ensure care_guides table exists and schedule daily SEO care guide generation for OxiSure Lifecycle Manager
-- Runs daily at 05:30 UTC (1:30 PM PHT)

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.care_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Equipment Care',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.care_guides ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'care_guides' AND policyname = 'Public read published care_guides'
  ) THEN
    CREATE POLICY "Public read published care_guides"
      ON public.care_guides FOR SELECT
      USING (status = 'published');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'oxisure-daily-care-guides') THEN
    PERFORM cron.unschedule('oxisure-daily-care-guides');
  END IF;
END $$;

SELECT cron.schedule(
  'oxisure-daily-care-guides',
  '30 5 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hoqzujbwyphxzikuknsk.supabase.co/functions/v1/auto-blog',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-trigger', 'true'
    ),
    body := '{"source": "pg_cron_daily"}'::jsonb,
    timeout_milliseconds := 120000
  ) AS request_id;
  $$
);

