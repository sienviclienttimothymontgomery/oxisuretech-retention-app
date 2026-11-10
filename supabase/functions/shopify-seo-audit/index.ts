import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-trigger",
};

const STORE_URL = "https://oxisuretechsolutions.com";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Audit Homepage SEO tags & HTTP status
    const homeStart = Date.now();
    const homeRes = await fetch(STORE_URL, {
      headers: { "User-Agent": "Sienvi-SEO-Auditor/1.0" },
      redirect: "follow",
    });
    const homeLatencyMs = Date.now() - homeStart;
    const homeStatus = homeRes.status;
    const homeHtml = await homeRes.text();

    const titleMatch = homeHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    const descMatch =
      homeHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      homeHtml.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : null;

    const canonicalMatch = homeHtml.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i
    );
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;

    const h1Count = (homeHtml.match(/<h1[\s>]/gi) || []).length;
    const jsonLdCount = (
      homeHtml.match(/<script[^>]+type=["']application\/ld\+json["']/gi) || []
    ).length;
    const hasOgTitle = /property=["']og:title["']/i.test(homeHtml);

    // 2. Audit /robots.txt
    const robotsRes = await fetch(`${STORE_URL}/robots.txt`, {
      headers: { "User-Agent": "Sienvi-SEO-Auditor/1.0" },
      redirect: "follow",
    });
    const robotsStatus = robotsRes.status;
    const robotsText = await robotsRes.text();
    const hasSitemapDirective = /Sitemap:/i.test(robotsText);

    // 3. Audit /sitemap.xml
    const sitemapRes = await fetch(`${STORE_URL}/sitemap.xml`, {
      headers: { "User-Agent": "Sienvi-SEO-Auditor/1.0" },
      redirect: "follow",
    });
    const sitemapStatus = sitemapRes.status;
    const sitemapXml = await sitemapRes.text();
    const sitemapLocMatches = sitemapXml.match(/<loc>([\s\S]*?)<\/loc>/gi) || [];
    const childSitemaps = sitemapLocMatches.map((m) =>
      m.replace(/<\/?loc>/gi, "").trim()
    );

    // 4. Ping IndexNow for rapid Bing/Yandex/Naver/Seznam discovery
    let indexNowStatus = 0;
    try {
      const indexNowRes = await fetch(
        `https://api.indexnow.org/indexnow?url=${encodeURIComponent(
          `${STORE_URL}/sitemap.xml`
        )}&key=oxisuretechsolutionsindexnow2026`,
        { method: "GET" }
      );
      indexNowStatus = indexNowRes.status;
    } catch (_e) {
      indexNowStatus = 0;
    }

    // 5. Calculate technical SEO health score & issues list
    const issues: string[] = [];
    let score = 100;

    if (homeStatus !== 200) {
      score -= 30;
      issues.push(`Homepage returned HTTP ${homeStatus}`);
    }
    if (!title) {
      score -= 15;
      issues.push("Missing <title> tag on homepage");
    }
    if (!metaDescription) {
      score -= 10;
      issues.push("Missing meta description on homepage");
    }
    if (!canonicalUrl) {
      score -= 10;
      issues.push("Missing canonical link tag on homepage");
    }
    if (h1Count === 0) {
      score -= 10;
      issues.push("No <h1> heading found on homepage");
    }
    if (robotsStatus !== 200 || !hasSitemapDirective) {
      score -= 10;
      issues.push("robots.txt missing or lacks Sitemap directive");
    }
    if (sitemapStatus !== 200 || childSitemaps.length === 0) {
      score -= 15;
      issues.push("sitemap.xml unreachable or contains 0 <loc> entries");
    }
    score = Math.max(0, score);

    const auditPayload = {
      store_domain: "oxisuretechsolutions.com",
      store_url: STORE_URL,
      seo_score: score,
      home_status: homeStatus,
      home_latency_ms: homeLatencyMs,
      robots_status: robotsStatus,
      sitemap_status: sitemapStatus,
      sitemap_entries_count: childSitemaps.length,
      page_title: title,
      meta_description: metaDescription,
      canonical_url: canonicalUrl,
      h1_count: h1Count,
      json_ld_count: jsonLdCount,
      has_og_title: hasOgTitle,
      has_sitemap_directive: hasSitemapDirective,
      indexnow_status: indexNowStatus,
      issues,
      raw_details: {
        child_sitemaps: childSitemaps,
        audited_at: new Date().toISOString(),
      },
    };

    const { data: inserted, error: insertError } = await supabase
      .from("shopify_seo_audits")
      .insert(auditPayload)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        audit: inserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
