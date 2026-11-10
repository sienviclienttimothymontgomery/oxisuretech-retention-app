-- Create shopify_seo_audits table and schedule daily OxiSure Tech Shopify SEO Audit
-- Runs daily at 05:45 UTC (1:45 PM PHT)

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.shopify_seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_domain TEXT NOT NULL DEFAULT 'oxisuretechsolutions.com',
  store_url TEXT NOT NULL DEFAULT 'https://oxisuretechsolutions.com',
  seo_score INTEGER NOT NULL DEFAULT 100,
  home_status INTEGER,
  home_latency_ms INTEGER,
  robots_status INTEGER,
  sitemap_status INTEGER,
  sitemap_entries_count INTEGER DEFAULT 0,
  page_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  h1_count INTEGER DEFAULT 0,
  json_ld_count INTEGER DEFAULT 0,
  has_og_title BOOLEAN DEFAULT false,
  has_sitemap_directive BOOLEAN DEFAULT false,
  indexnow_status INTEGER DEFAULT 0,
  issues TEXT[] DEFAULT '{}',
  raw_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shopify_seo_audits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shopify_seo_audits' AND policyname = 'Public read shopify_seo_audits'
  ) THEN
    CREATE POLICY "Public read shopify_seo_audits"
      ON public.shopify_seo_audits FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'oxisure-shopify-daily-seo-audit') THEN
    PERFORM cron.unschedule('oxisure-shopify-daily-seo-audit');
  END IF;
END $$;

SELECT cron.schedule(
  'oxisure-shopify-daily-seo-audit',
  '45 5 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hoqzujbwyphxzikuknsk.supabase.co/functions/v1/shopify-seo-audit',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-trigger', 'true'
    ),
    body := '{"source": "pg_cron_daily_shopify_seo_audit"}'::jsonb,
    timeout_milliseconds := 60000
  ) AS request_id;
  $$
);
