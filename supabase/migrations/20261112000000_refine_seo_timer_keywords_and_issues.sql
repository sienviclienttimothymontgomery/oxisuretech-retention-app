-- Refine OxiSure Tech Daily SEO Timer Pipeline:
-- 1. Extend public.shopify_seo_audits with keyword_suggestions, issue_remediations, audited_pages, and addressed_in_care_guide_id
-- 2. Extend public.care_guides with meta_description, seo_keywords, long_tail_queries, addressed_seo_issues, and faq_schema
-- 3. Order pg_cron jobs so oxisure-shopify-daily-seo-audit runs at 05:30 UTC (1:30 PM PHT) first,
--    followed by oxisure-daily-care-guides at 05:45 UTC (1:45 PM PHT) to consume daily keyword suggestions & address SEO issues.

ALTER TABLE public.shopify_seo_audits
  ADD COLUMN IF NOT EXISTS keyword_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS issue_remediations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audited_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS addressed_in_care_guide_id UUID;

ALTER TABLE public.care_guides
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS long_tail_queries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS addressed_seo_issues TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faq_schema JSONB DEFAULT '[]'::jsonb;

-- Reschedule daily SEO timers in optimal execution order:
-- Step 1 (05:30 UTC / 1:30 PM PHT): Run shopify-seo-audit to audit URLs, generate keyword suggestions & issue remediations
-- Step 2 (05:45 UTC / 1:45 PM PHT): Run auto-blog to publish daily care guide targeting suggested keywords & outstanding SEO gaps
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'oxisure-shopify-daily-seo-audit') THEN
    PERFORM cron.unschedule('oxisure-shopify-daily-seo-audit');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'oxisure-daily-care-guides') THEN
    PERFORM cron.unschedule('oxisure-daily-care-guides');
  END IF;
END $$;

SELECT cron.schedule(
  'oxisure-shopify-daily-seo-audit',
  '30 5 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hoqzujbwyphxzikuknsk.supabase.co/functions/v1/shopify-seo-audit',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"source": "pg_cron_daily_seo_audit", "chain_auto_blog": true}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'oxisure-daily-care-guides',
  '45 5 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hoqzujbwyphxzikuknsk.supabase.co/functions/v1/auto-blog',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"source": "pg_cron_daily_care_guides"}'::jsonb
  );
  $$
);

NOTIFY pgrst, 'reload schema';

