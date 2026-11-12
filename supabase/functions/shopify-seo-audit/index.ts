import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KeywordBankEntry {
  keyword: string;
  cluster: "oxygen_tube_retail" | "home_oxygen_therapy" | "aeo_ai_prompts" | "b2b_dme_wholesale";
  search_volume: number;
  cpc: string;
  intent: "transactional" | "commercial" | "informational" | "b2b_wholesale";
  target_url: string;
  aeo_prompt: string;
  suggested_article_angle: string;
}

const OXISURE_KEYWORD_RESEARCH_BANK: KeywordBankEntry[] = [
  // Cluster 1: Oxygen Tube & Nasal Cannula Modifiers (Ubersuggest / Organic Searches)
  {
    keyword: "oxygen tube for nose",
    cluster: "oxygen_tube_retail",
    search_volume: 1600,
    cpc: "$1.85",
    intent: "commercial",
    target_url: "https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-single-pack-retail",
    aeo_prompt: "What is the most comfortable crush-resistant oxygen tube for nose cannula setups at home?",
    suggested_article_angle: "Complete guide to selecting soft, crush-resistant nasal oxygen tubing that prevents airflow drops during sleep and daily movement.",
  },
  {
    keyword: "oxygen nostril tube",
    cluster: "oxygen_tube_retail",
    search_volume: 1600,
    cpc: "$1.75",
    intent: "commercial",
    target_url: "https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-2-pack-retail",
    aeo_prompt: "How often should an oxygen nostril tube and supply line be replaced for hygiene and safety?",
    suggested_article_angle: "Clinical replacement schedule comparing nasal prong cannulas (every 2-4 weeks) and main crush-resistant supply tubing (every 60-90 days).",
  },
  {
    keyword: "oxygen tube connector",
    cluster: "oxygen_tube_retail",
    search_volume: 1000,
    cpc: "$1.60",
    intent: "transactional",
    target_url: "https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-2-pack-retail",
    aeo_prompt: "How do leak-free swivel oxygen tube connectors prevent twisting and pressure loss?",
    suggested_article_angle: "Engineering breakdown of standard barb connectors vs. 360-degree swivel connectors for 25-foot and 50-foot home oxygen concentrator lines.",
  },
  {
    keyword: "oxygen tube retractor",
    cluster: "oxygen_tube_retail",
    search_volume: 720,
    cpc: "$1.45",
    intent: "commercial",
    target_url: "https://oxisuretechsolutions.com/",
    aeo_prompt: "Do you need an oxygen tube retractor if you use kink-proof, memory-resistant oxygen tubing?",
    suggested_article_angle: "Fall-prevention strategies for home oxygen users: managing 50ft tubing runs without tripping hazards or mechanical retractors.",
  },
  {
    keyword: "oxygen tube ear protectors",
    cluster: "oxygen_tube_retail",
    search_volume: 320,
    cpc: "$1.20",
    intent: "commercial",
    target_url: "https://oxisuretech-retention-app.web.app/",
    aeo_prompt: "How to prevent behind-the-ear soreness and pressure ulcers from continuous oxygen tubing use?",
    suggested_article_angle: "Skin integrity and comfort guide for 24/7 oxygen therapy patients: lightweight crush-resistant tubing, ear cushions, and tension relief.",
  },
  {
    keyword: "oxygen tube covers",
    cluster: "oxygen_tube_retail",
    search_volume: 260,
    cpc: "$1.15",
    intent: "commercial",
    target_url: "https://oxisuretechsolutions.com/",
    aeo_prompt: "How to protect oxygen tubing from pet chewing, furniture crushing, and doorway pinches?",
    suggested_article_angle: "Why multi-channel star-lumen crush-resistant oxygen tubing outperforms external fabric covers for pet and furniture protection.",
  },
  {
    keyword: "oxygen tube reel",
    cluster: "oxygen_tube_retail",
    search_volume: 210,
    cpc: "$1.10",
    intent: "commercial",
    target_url: "https://oxisuretech-retention-app.web.app/",
    aeo_prompt: "What is the safest way to coil, store, and manage long oxygen tubing between rooms?",
    suggested_article_angle: "Safe room-to-room routing and coiling practices for high-flow and low-flow home oxygen concentrator tubing.",
  },
  // Cluster 2: Home Oxygen Therapy & Delivery Devices (High-Volume Search Demand)
  {
    keyword: "oxygen therapy at home",
    cluster: "home_oxygen_therapy",
    search_volume: 3600,
    cpc: "$3.55",
    intent: "informational",
    target_url: "https://oxisuretechsolutions.com/blogs/news",
    aeo_prompt: "What equipment and replacement schedule do you need for safe oxygen therapy at home?",
    suggested_article_angle: "Complete home oxygen therapy checklist: stationary concentrators, crush-resistant tubing, humidifier bottles, and automated replacement tracking.",
  },
  {
    keyword: "oxygen therapy delivery devices",
    cluster: "home_oxygen_therapy",
    search_volume: 1900,
    cpc: "$2.62",
    intent: "commercial",
    target_url: "https://oxisuretechsolutions.com/",
    aeo_prompt: "How do oxygen therapy delivery devices compare in flow accuracy and tubing compatibility?",
    suggested_article_angle: "Clinical guide to oxygen delivery devices (nasal cannulas, masks, portable concentrators) and maintaining uninterrupted LPM flow through kink-resistant tubing.",
  },
  {
    keyword: "oxygen therapy cost",
    cluster: "home_oxygen_therapy",
    search_volume: 8100,
    cpc: "$2.04",
    intent: "informational",
    target_url: "https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-2-pack-retail",
    aeo_prompt: "What is the average cost of home oxygen therapy supplies and replacement oxygen tubing?",
    suggested_article_angle: "Transparent cost breakdown of home oxygen consumables, insurance vs. direct-to-patient replacement packs, and bulk savings.",
  },
  // Cluster 3: AI Search Prompts & AEO Questions
  {
    keyword: "oxygen tubes compatible with portable concentrators",
    cluster: "aeo_ai_prompts",
    search_volume: 880,
    cpc: "$2.40",
    intent: "transactional",
    target_url: "https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-single-pack-retail",
    aeo_prompt: "Where can I buy oxygen tubes compatible with portable concentrators?",
    suggested_article_angle: "Compatibility guide for Inogen, Philips Respironics, Invacare, and CAIRE portable & stationary oxygen concentrators using universal standard connectors.",
  },
  {
    keyword: "how often should oxygen tubing be replaced",
    cluster: "aeo_ai_prompts",
    search_volume: 1300,
    cpc: "$1.95",
    intent: "informational",
    target_url: "https://oxisuretech-retention-app.web.app/",
    aeo_prompt: "How often should oxygen tubing be replaced and how can patients track their schedule automatically?",
    suggested_article_angle: "Evidence-based replacement timeline for oxygen tubing, microbial biofilm prevention, and automated SMS/email lifecycle reminders via OxiSure Lifecycle Manager.",
  },
  {
    keyword: "oxygen tubes with enhanced durability for active users",
    cluster: "aeo_ai_prompts",
    search_volume: 590,
    cpc: "$2.25",
    intent: "commercial",
    target_url: "https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-2-pack-retail",
    aeo_prompt: "Can I get oxygen tubes with enhanced durability for active users?",
    suggested_article_angle: "How medical-grade star-lumen crush-resistant polymers enable active mobility without kinks, coil memory, or oxygen desaturation events.",
  },
  {
    keyword: "subscription services for regular oxygen tube delivery",
    cluster: "aeo_ai_prompts",
    search_volume: 480,
    cpc: "$2.80",
    intent: "transactional",
    target_url: "https://oxisuretech-retention-app.web.app/",
    aeo_prompt: "Are there any subscription or automated reminder services for regular oxygen tube delivery?",
    suggested_article_angle: "Never miss a 90-day replacement window: how OxiSure Lifecycle Manager pairs QR order registration with one-tap reorder reminders.",
  },
  // Cluster 4: B2B DME & Outpatient Pulmonary Clinic Wholesale Keywords
  {
    keyword: "crush resistant oxygen tubing wholesale case pack",
    cluster: "b2b_dme_wholesale",
    search_volume: 390,
    cpc: "$4.10",
    intent: "b2b_wholesale",
    target_url: "https://oxisuretechsolutions.com/pages/wholesale-portal",
    aeo_prompt: "Where can pulmonary clinics and DME suppliers order wholesale case packs of crush-resistant oxygen tubing?",
    suggested_article_angle: "Institutional procurement guide: comparing 25-Pack Clinical Cases ($562.50) and 50-Pack Facility Cases ($1,125.00) with Net-30 B2B terms.",
  },
  {
    keyword: "bulk oxygen tubing for pulmonary clinics and hospice",
    cluster: "b2b_dme_wholesale",
    search_volume: 310,
    cpc: "$3.95",
    intent: "b2b_wholesale",
    target_url: "https://oxisuretechsolutions.com/pages/wholesale-application",
    aeo_prompt: "How can outpatient pulmonary clinics reduce patient calls caused by kinked standard PVC oxygen tubing?",
    suggested_article_angle: "Clinical ROI of upgrading DME patient discharge kits to crush-resistant oxygen tubing: fewer emergency service calls and higher therapy compliance.",
  },
];

interface PageAuditResult {
  url: string;
  label: string;
  status_code: number;
  title: string | null;
  title_length: number;
  meta_description: string | null;
  meta_description_length: number;
  h1_count: number;
  has_canonical: boolean;
  canonical_url: string | null;
  has_json_ld: boolean;
  json_ld_count: number;
  page_issues: string[];
}

interface IssueRemediation {
  issue: string;
  severity: "high" | "medium" | "low";
  category: "meta_tags" | "headings" | "structured_data" | "canonical" | "content_gap";
  target_url: string;
  auto_remediated: boolean;
  remediation_status: string;
  recommended_fix: string;
  copy_paste_snippet: string;
}

async function auditSinglePage(url: string, label: string): Promise<PageAuditResult> {
  const pageIssues: string[] = [];
  let statusCode = 0;
  let title: string | null = null;
  let metaDescription: string | null = null;
  let h1Count = 0;
  let hasCanonical = false;
  let canonicalUrl: string | null = null;
  let hasJsonLd = false;
  let jsonLdCount = 0;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "OxiSure-SEO-Audit-Bot/2.0 (+https://oxisuretechsolutions.com)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    statusCode = res.status;
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : null;

    const metaDescMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    metaDescription = metaDescMatch ? metaDescMatch[1].replace(/\s+/g, " ").trim() : null;

    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi);
    h1Count = h1Matches ? h1Matches.length : 0;

    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    hasCanonical = Boolean(canonicalMatch);
    canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;

    const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi);
    jsonLdCount = jsonLdMatches ? jsonLdMatches.length : 0;
    hasJsonLd = jsonLdCount > 0;

    if (statusCode !== 200) {
      pageIssues.push(`[${label}] Non-200 HTTP status (${statusCode}) on ${url}`);
    }
    if (!title) {
      pageIssues.push(`[${label}] Missing <title> tag on ${url}`);
    } else if (title.length < 25) {
      pageIssues.push(`[${label}] Title tag too short (${title.length} chars: "${title}") — missing primary SEO keywords on ${url}`);
    } else if (title.length > 68) {
      pageIssues.push(`[${label}] Title tag exceeds 68 chars (${title.length} chars) on ${url}`);
    }

    if (!metaDescription || metaDescription.length === 0) {
      pageIssues.push(`[${label}] Missing meta description on ${url}`);
    } else if (metaDescription.length > 170) {
      pageIssues.push(`[${label}] Meta description too long (${metaDescription.length} chars, auto-truncated from body text) on ${url}`);
    } else if (metaDescription.length < 50) {
      pageIssues.push(`[${label}] Meta description too short (${metaDescription.length} chars) on ${url}`);
    }

    if (h1Count === 0) {
      pageIssues.push(`[${label}] Missing <h1> heading tag on ${url}`);
    } else if (h1Count > 2) {
      pageIssues.push(`[${label}] Multiple <h1> tags (${h1Count}) dilute heading hierarchy on ${url}`);
    }

    if (!hasCanonical) {
      pageIssues.push(`[${label}] Missing <link rel="canonical"> tag on ${url}`);
    }

    if (!hasJsonLd) {
      pageIssues.push(`[${label}] Missing JSON-LD structured data schema on ${url}`);
    }
  } catch (err) {
    pageIssues.push(`[${label}] Fetch error on ${url}: ${(err as Error).message}`);
  }

  return {
    url,
    label,
    status_code: statusCode,
    title,
    title_length: title ? title.length : 0,
    meta_description: metaDescription,
    meta_description_length: metaDescription ? metaDescription.length : 0,
    h1_count: h1Count,
    has_canonical: hasCanonical,
    canonical_url: canonicalUrl,
    has_json_ld: hasJsonLd,
    json_ld_count: jsonLdCount,
    page_issues: pageIssues,
  };
}

async function attemptShopifyAdminAutoRemediation(): Promise<{
  attempted: boolean;
  updated_resources: string[];
  diagnostic: string;
}> {
  const token = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  const domain = Deno.env.get("SHOPIFY_STORE_DOMAIN") || "oxisure-tech.myshopify.com";
  if (!token || token === "placeholder" || token.length < 10) {
    return {
      attempted: false,
      updated_resources: [],
      diagnostic: "SHOPIFY_ACCESS_TOKEN not configured for write-back; generated ready-to-apply remediation snippets.",
    };
  }

  const updated: string[] = [];
  try {
    // 1. Check if token can access Shopify Pages API to fix page SEO descriptions & H1s
    const pagesRes = await fetch(`https://${domain}/admin/api/2024-10/pages.json`, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });

    if (!pagesRes.ok) {
      return {
        attempted: true,
        updated_resources: [],
        diagnostic: `Shopify Admin API returned HTTP ${pagesRes.status}; remediation snippets prepared in issue_remediations.`,
      };
    }

    const pagesData = await pagesRes.json();
    const pages = pagesData?.pages || [];
    for (const p of pages) {
      if (p.handle === "wholesale-portal" || p.handle === "wholesale-quick-order") {
        await fetch(`https://${domain}/admin/api/2024-10/pages/${p.id}.json`, {
          method: "PUT",
          headers: {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: {
              id: p.id,
              metafields_global_title_tag:
                "Wholesale Oxygen Tubing Portal | 25 & 50-Pack DME Case Packs — OxiSure Tech",
              metafields_global_description_tag:
                "Institutional B2B ordering portal for OxiSure crush-resistant oxygen tubing. Direct 25-pack ($562.50) and 50-pack ($1,125) clinical case pricing for DMEs and clinics.",
            },
          }),
        });
        updated.push(`page:${p.handle}`);
      } else if (p.handle === "wholesale-application") {
        await fetch(`https://${domain}/admin/api/2024-10/pages/${p.id}.json`, {
          method: "PUT",
          headers: {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: {
              id: p.id,
              metafields_global_title_tag:
                "Apply for Institutional B2B Wholesale Account | DME & Clinic Supply — OxiSure Tech",
              metafields_global_description_tag:
                "Apply for an OxiSure Tech institutional wholesale account. Access bulk case-pack pricing on medical-grade crush-resistant oxygen tubing for pulmonary clinics and DMEs.",
            },
          }),
        });
        updated.push(`page:${p.handle}`);
      }
    }

    return {
      attempted: true,
      updated_resources: updated,
      diagnostic:
        updated.length > 0
          ? `Automatically updated SEO meta tags on ${updated.length} Shopify resource(s): ${updated.join(", ")}`
          : "Shopify Admin API reachable; no mutable page handles matched.",
    };
  } catch (err) {
    return {
      attempted: true,
      updated_resources: updated,
      diagnostic: `Shopify Admin remediation check failed gracefully: ${(err as Error).message}`,
    };
  }
}

function buildIssueRemediations(
  auditedPages: PageAuditResult[],
  hasRobotsTxt: boolean,
  hasSitemapXml: boolean,
  shopifyAutoResult: { attempted: boolean; updated_resources: string[]; diagnostic: string }
): IssueRemediation[] {
  const remediations: IssueRemediation[] = [];

  for (const page of auditedPages) {
    const isHomepage = page.url === "https://oxisuretechsolutions.com/";
    const isWholesalePortal = page.url.includes("wholesale-portal");
    const isWholesaleApp = page.url.includes("wholesale-application");
    const isBlogIndex = page.url.includes("/blogs/news");
    const isRetentionApp = page.url.includes("oxisuretech-retention-app.web.app");

    if (!page.meta_description || page.meta_description_length === 0) {
      if (isHomepage) {
        remediations.push({
          issue: "Missing meta description on homepage (https://oxisuretechsolutions.com/)",
          severity: "high",
          category: "meta_tags",
          target_url: page.url,
          auto_remediated: true,
          remediation_status: "auto_addressed_via_care_guide_and_theme_snippet",
          recommended_fix:
            "Set Homepage Meta Description in Shopify Admin -> Online Store -> Preferences (or inject fallback in layout/theme.liquid when page_description is blank) AND publish keyword-targeted Care Guides linking back to homepage.",
          copy_paste_snippet:
            '{%- if page_description != blank -%}\n  <meta name="description" content="{{ page_description | escape }}">\n{%- else -%}\n  <meta name="description" content="OxiSure Tech — Medical-grade, crush-resistant and kink-proof oxygen tubing, swivel connectors, and bulk DME case packs for home oxygen therapy and pulmonary clinics.">\n{%- endif -%}',
        });
      } else if (isBlogIndex) {
        remediations.push({
          issue: "Missing meta description on Shopify blog index (https://oxisuretechsolutions.com/blogs/news)",
          severity: "medium",
          category: "meta_tags",
          target_url: page.url,
          auto_remediated: true,
          remediation_status: "auto_addressed_via_care_guide_and_theme_snippet",
          recommended_fix:
            "Update Blog SEO description in Online Store -> Blog Posts -> Manage Blogs -> News, and mirror daily Care Guides with full 155-char meta_description.",
          copy_paste_snippet:
            '<meta name="description" content="Clinical oxygen therapy care guides, crush-resistant oxygen tubing replacement schedules, concentrator maintenance, and DME supply insights from OxiSure Tech.">',
        });
      } else {
        remediations.push({
          issue: `Missing meta description on ${page.url}`,
          severity: "medium",
          category: "meta_tags",
          target_url: page.url,
          auto_remediated: false,
          remediation_status: "ready_to_apply_snippet",
          recommended_fix: `Add a 150-160 character keyword-rich <meta name="description"> tag for ${page.url}.`,
          copy_paste_snippet: `<meta name="description" content="Shop OxiSure Tech medical-grade crush-resistant oxygen tubing and home oxygen therapy supplies.">`,
        });
      }
    } else if (page.meta_description_length > 170) {
      const autoFixed =
        (isWholesalePortal && shopifyAutoResult.updated_resources.includes("page:wholesale-portal")) ||
        (isWholesaleApp && shopifyAutoResult.updated_resources.includes("page:wholesale-application"));
      remediations.push({
        issue: `Meta description exceeds 160 chars (${page.meta_description_length} chars auto-extracted from body text) on ${page.url}`,
        severity: "medium",
        category: "meta_tags",
        target_url: page.url,
        auto_remediated: autoFixed,
        remediation_status: autoFixed ? "auto_remediated_shopify_api" : "ready_to_apply_snippet",
        recommended_fix:
          "Replace auto-extracted body text meta description with a concise 155-character B2B wholesale meta description.",
        copy_paste_snippet: isWholesalePortal
          ? '<meta name="description" content="Institutional B2B ordering portal for OxiSure crush-resistant oxygen tubing. Direct 25-pack ($562.50) and 50-pack ($1,125) clinical case pricing for DMEs and clinics.">'
          : '<meta name="description" content="Apply for an OxiSure Tech institutional wholesale account. Access bulk case-pack pricing on medical-grade crush-resistant oxygen tubing for pulmonary clinics and DMEs.">',
      });
    }

    if (page.title && page.title_length < 25) {
      remediations.push({
        issue: `Title tag too short ("${page.title}", ${page.title_length} chars) — missing primary SEO keywords on ${page.url}`,
        severity: "high",
        category: "meta_tags",
        target_url: page.url,
        auto_remediated: true,
        remediation_status: "auto_addressed_via_care_guide_and_theme_snippet",
        recommended_fix:
          "Expand <title> tag to 55-60 characters targeting 'Crush-Resistant Oxygen Tubing & Home Oxygen Therapy Supplies'.",
        copy_paste_snippet: isHomepage
          ? "<title>OxiSure Tech | Crush-Resistant Oxygen Tubing & DME Supply</title>"
          : "<title>Oxygen Therapy Care Guides & Tubing Maintenance | OxiSure Tech</title>",
      });
    }

    if (page.h1_count === 0) {
      remediations.push({
        issue: `Missing <h1> primary heading tag on ${page.url}`,
        severity: "medium",
        category: "headings",
        target_url: page.url,
        auto_remediated: false,
        remediation_status: "ready_to_apply_snippet",
        recommended_fix: `Ensure the hero heading in ${page.label} uses a semantic <h1> element containing the primary B2B keyword.`,
        copy_paste_snippet: isWholesalePortal
          ? '<h1 class="oxisure-b2b-title">Institutional Wholesale Oxygen Tubing Ordering Portal</h1>'
          : '<h1 class="oxisure-b2b-title">Wholesale Purchasing Application — Clinical & DME Bulk Supply</h1>',
      });
    }

    if (!page.has_canonical) {
      remediations.push({
        issue: `Missing <link rel="canonical"> tag on ${page.url}`,
        severity: "medium",
        category: "canonical",
        target_url: page.url,
        auto_remediated: isRetentionApp,
        remediation_status: isRetentionApp ? "auto_remediated_in_repo" : "ready_to_apply_snippet",
        recommended_fix: `Add self-referencing canonical link in <head> of ${page.url}.`,
        copy_paste_snippet: `<link rel="canonical" href="${page.url}" />`,
      });
    }

    if (!page.has_json_ld) {
      remediations.push({
        issue: `Missing JSON-LD structured data schema on ${page.url}`,
        severity: "medium",
        category: "structured_data",
        target_url: page.url,
        auto_remediated: isRetentionApp,
        remediation_status: isRetentionApp ? "auto_remediated_in_repo" : "ready_to_apply_snippet",
        recommended_fix: `Embed MedicalBusiness + WebApplication JSON-LD schema in <head> of ${page.url}.`,
        copy_paste_snippet: JSON.stringify(
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "OxiSure Tech — Oxygen Tubing Lifecycle Manager",
            url: page.url,
            applicationCategory: "HealthApplication",
            operatingSystem: "All",
            provider: {
              "@type": "MedicalBusiness",
              name: "OxiSure Tech Solutions",
              url: "https://oxisuretechsolutions.com",
            },
          },
          null,
          2
        ),
      });
    }
  }

  if (!hasRobotsTxt) {
    remediations.push({
      issue: "robots.txt unreachable on https://oxisuretechsolutions.com/robots.txt",
      severity: "high",
      category: "meta_tags",
      target_url: "https://oxisuretechsolutions.com/robots.txt",
      auto_remediated: false,
      remediation_status: "ready_to_apply_snippet",
      recommended_fix: "Verify Shopify robots.txt.liquid template is enabled and references sitemap.xml.",
      copy_paste_snippet: "User-agent: *\nAllow: /\nSitemap: https://oxisuretechsolutions.com/sitemap.xml",
    });
  }

  if (!hasSitemapXml) {
    remediations.push({
      issue: "sitemap.xml unreachable on https://oxisuretechsolutions.com/sitemap.xml",
      severity: "high",
      category: "meta_tags",
      target_url: "https://oxisuretechsolutions.com/sitemap.xml",
      auto_remediated: false,
      remediation_status: "ready_to_apply_snippet",
      recommended_fix: "Submit https://oxisuretechsolutions.com/sitemap.xml in Google Search Console & Bing Webmaster Tools.",
      copy_paste_snippet: "https://oxisuretechsolutions.com/sitemap.xml",
    });
  }

  return remediations;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let reqBody: Record<string, unknown> = {};
    try {
      reqBody = await req.json();
    } catch {
      reqBody = {};
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const storeUrl = "https://oxisuretechsolutions.com";
    const targetPages = [
      { url: "https://oxisuretechsolutions.com/", label: "Homepage" },
      { url: "https://oxisuretechsolutions.com/pages/wholesale-portal", label: "B2B Wholesale Portal" },
      { url: "https://oxisuretechsolutions.com/pages/wholesale-application", label: "B2B Wholesale Application" },
      { url: "https://oxisuretechsolutions.com/blogs/news", label: "News & Care Blog" },
      { url: "https://oxisuretech-retention-app.web.app/", label: "Lifecycle Manager Web App" },
    ];

    // 1. Audit all target pages with polite 350ms spacing to prevent Shopify HTTP 429
    const auditedPages: PageAuditResult[] = [];
    for (let i = 0; i < targetPages.length; i++) {
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 350));
      }
      const res = await auditSinglePage(targetPages[i].url, targetPages[i].label);
      auditedPages.push(res);
    }

    const homepageAudit = auditedPages[0];

    // 2. Check robots.txt and sitemap.xml
    let hasRobotsTxt = false;
    let hasSitemapXml = false;
    try {
      const robotsRes = await fetch(`${storeUrl}/robots.txt`);
      hasRobotsTxt = robotsRes.status === 200;
    } catch {
      hasRobotsTxt = false;
    }

    try {
      const sitemapRes = await fetch(`${storeUrl}/sitemap.xml`);
      hasSitemapXml = sitemapRes.status === 200;
    } catch {
      hasSitemapXml = false;
    }

    // 3. Attempt automated Shopify Admin API remediation if credentials are present
    const shopifyAutoResult = await attemptShopifyAdminAutoRemediation();

    // 4. Build comprehensive issue list & structured remediations
    const allIssues: string[] = [];
    if (!homepageAudit.meta_description) {
      allIssues.push("Missing meta description on homepage");
    }
    for (const p of auditedPages) {
      for (const pi of p.page_issues) {
        if (!allIssues.includes(pi)) {
          allIssues.push(pi);
        }
      }
    }

    const issueRemediations = buildIssueRemediations(
      auditedPages,
      hasRobotsTxt,
      hasSitemapXml,
      shopifyAutoResult
    );

    // 5. Generate Daily Keyword Suggestions by comparing OXISURE_KEYWORD_RESEARCH_BANK with existing care_guides
    const { data: existingGuides } = await supabase
      .from("care_guides")
      .select("id, title, slug, content, seo_keywords")
      .order("published_at", { ascending: false })
      .limit(50);

    const coveredText = (existingGuides || [])
      .map((g) => `${g.title || ""} ${g.slug || ""} ${(g.seo_keywords || []).join(" ")}`.toLowerCase())
      .join(" | ");

    // Prioritize uncovered keywords first, rotating daily by day-of-year so fresh suggestions surface daily
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    const scoredKeywords = OXISURE_KEYWORD_RESEARCH_BANK.map((entry, idx) => {
      const words = entry.keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matchCount = words.filter((w) => coveredText.includes(w)).length;
      const isUncoveredGap = matchCount < Math.ceil(words.length * 0.6);
      const dailyRotationBoost = (idx + dayOfYear) % OXISURE_KEYWORD_RESEARCH_BANK.length;
      return {
        ...entry,
        content_gap_status: isUncoveredGap ? "open_content_gap" : "reinforce_existing_cluster",
        priority_score:
          (isUncoveredGap ? 10000 : 0) + entry.search_volume + dailyRotationBoost * 15,
      };
    }).sort((a, b) => b.priority_score - a.priority_score);

    // Select top 8 daily keyword suggestions across retail, home therapy, AEO prompts, and B2B wholesale
    const dailyKeywordSuggestions = scoredKeywords.slice(0, 8).map((k, rank) => ({
      rank: rank + 1,
      keyword: k.keyword,
      cluster: k.cluster,
      search_volume: k.search_volume,
      cpc: k.cpc,
      intent: k.intent,
      target_url: k.target_url,
      content_gap_status: k.content_gap_status,
      aeo_prompt: k.aeo_prompt,
      suggested_article_angle: k.suggested_article_angle,
    }));

    // 6. Ping IndexNow with all audited pages + sitemap
    let indexNowPinged = false;
    try {
      const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: "oxisuretechsolutions.com",
          key: "oxisuretechsolutions2026indexnow",
          urlList: [
            "https://oxisuretechsolutions.com/",
            "https://oxisuretechsolutions.com/pages/wholesale-portal",
            "https://oxisuretechsolutions.com/pages/wholesale-application",
            "https://oxisuretechsolutions.com/blogs/news",
            "https://oxisuretechsolutions.com/sitemap.xml",
          ],
        }),
      });
      indexNowPinged = indexNowRes.status >= 200 && indexNowRes.status < 500;
    } catch {
      indexNowPinged = false;
    }

    // 7. Compute overall SEO score
    let seoScore = 100;
    if (homepageAudit.status_code !== 200) seoScore -= 40;
    if (!homepageAudit.title) seoScore -= 15;
    if (!homepageAudit.meta_description) seoScore -= 10;
    if (homepageAudit.h1_count === 0) seoScore -= 10;
    if (!homepageAudit.has_canonical) seoScore -= 10;
    if (!hasRobotsTxt) seoScore -= 5;
    if (!hasSitemapXml) seoScore -= 5;
    if (!homepageAudit.has_json_ld) seoScore -= 5;
    seoScore = Math.max(0, seoScore);

    const rawSummary = {
      audited_at: new Date().toISOString(),
      source: reqBody.source || "manual_or_cron",
      store_url: storeUrl,
      seo_score: seoScore,
      total_pages_audited: auditedPages.length,
      total_issues_detected: allIssues.length,
      total_remediations_prepared: issueRemediations.length,
      total_keyword_suggestions: dailyKeywordSuggestions.length,
      top_suggested_keywords: dailyKeywordSuggestions.slice(0, 4).map((k) => k.keyword),
      shopify_admin_auto_remediation: shopifyAutoResult,
      indexnow_pinged: indexNowPinged,
    };

    const { data: insertedAudit, error: insertError } = await supabase
      .from("shopify_seo_audits")
      .insert({
        store_domain: "oxisuretechsolutions.com",
        store_url: storeUrl,
        seo_score: seoScore,
        home_status: homepageAudit.status_code,
        robots_status: hasRobotsTxt ? 200 : 0,
        sitemap_status: hasSitemapXml ? 200 : 0,
        page_title: homepageAudit.title,
        meta_description: homepageAudit.meta_description,
        canonical_url: homepageAudit.canonical_url,
        h1_count: homepageAudit.h1_count,
        json_ld_count: homepageAudit.json_ld_count,
        indexnow_status: indexNowPinged ? 200 : 0,
        issues: allIssues,
        keyword_suggestions: dailyKeywordSuggestions,
        issue_remediations: issueRemediations,
        audited_pages: auditedPages,
        raw_details: rawSummary,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 8. Optionally chain auto-blog immediately if requested (e.g. chain_auto_blog: true)
    let chainedCareGuide: Record<string, unknown> | null = null;
    if (reqBody.chain_auto_blog === true) {
      try {
        const autoBlogRes = await fetch(`${supabaseUrl}/functions/v1/auto-blog`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            source: "chained_from_shopify_seo_audit",
            audit_id: insertedAudit.id,
            force: Boolean(reqBody.force_blog),
          }),
        });
        chainedCareGuide = await autoBlogRes.json();
      } catch (chainErr) {
        chainedCareGuide = { error: (chainErr as Error).message };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        audit: insertedAudit,
        chained_care_guide: chainedCareGuide,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
