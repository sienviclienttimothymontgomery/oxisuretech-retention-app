import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-trigger",
};

const TOPIC_POOL = [
  {
    topic: "Monthly Filter & Cannula Replacement Schedule for Home Oxygen Concentrators",
    category: "Equipment Maintenance",
    keywords: ["oxygen concentrator filter replacement", "OxiSure care guide", "medical equipment maintenance"],
  },
  {
    topic: "How to Maximize Battery Longevity on Portable Oxygen Concentrators",
    category: "Portable Oxygen Care",
    keywords: ["portable oxygen battery life", "POC maintenance", "OxiSure Tech"],
  },
  {
    topic: "Preventive Consumable Replenishment: Reducing Equipment Downtime for Clinics & Home Care",
    category: "B2B Lifecycle Management",
    keywords: ["respiratory consumables", "preventive maintenance schedule", "OxiSure Lifecycle Manager"],
  },
  {
    topic: "Cleaning and Sanitizing Humidifier Bottles and Tubing Safely",
    category: "Hygiene & Safety",
    keywords: ["oxygen humidifier cleaning", "tubing replacement frequency", "respiratory hygiene"],
  },
  {
    topic: "Troubleshooting Common Oxygen Purity & Flow Alerts Before Requesting Service",
    category: "Troubleshooting",
    keywords: ["oxygen concentrator alerts", "flow rate check", "OxiSure support"],
  },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body from pg_cron is valid
    }

    const { data: recentGuides } = await supabase
      .from("care_guides")
      .select("title, slug, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    const force = body?.force === true;
    if (!force && recentGuides && recentGuides.length > 0 && recentGuides[0].created_at) {
      const hoursSinceLast =
        (Date.now() - new Date(recentGuides[0].created_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 20) {
        return new Response(
          JSON.stringify({
            success: true,
            skipped: true,
            message: "Daily OxiSure care guide already generated within the last 20 hours.",
            latestGuide: recentGuides[0],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const existingTitles = new Set(
      (recentGuides || []).map((g: any) => (g.title || "").toLowerCase())
    );
    const selected =
      TOPIC_POOL.find((t) => !existingTitles.has(t.topic.toLowerCase())) ||
      TOPIC_POOL[Math.floor(Date.now() / 86400000) % TOPIC_POOL.length];

    let title = selected.topic;
    let excerpt = `Preventive maintenance and lifecycle care guide on ${selected.topic.toLowerCase()}.`;
    let content = `## ${selected.topic}\n\nProactive lifecycle maintenance keeps OxiSure respiratory equipment operating at peak clinical reliability.\n\n### Recommended Maintenance Checklist\n- Inspect intake filters weekly and replace consumables on schedule\n- Log service milestones inside OxiSure Lifecycle Manager\n- Contact OxiSure Tech Solutions for certified replacement parts and preventive calibration.`;

    if (geminiApiKey) {
      const prompt = `Write a clear, authoritative SEO & AEO equipment care and lifecycle maintenance article for OxiSure Tech (oxisuretechsolutions.com / OxiSure Lifecycle Manager).
Topic: ${selected.topic}
Category: ${selected.category}
Target Keywords: ${selected.keywords.join(", ")}
Return JSON with keys: "title", "excerpt", "content" (Markdown with H2/H3 headings and FAQ section).`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          title = parsed.title || title;
          excerpt = parsed.excerpt || excerpt;
          content = parsed.content || content;
        }
      }
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      new Date().toISOString().slice(0, 10);

    const { data: inserted, error: insertError } = await supabase
      .from("care_guides")
      .insert({
        title,
        slug,
        excerpt,
        content,
        category: selected.category,
        tags: selected.keywords,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        guide: inserted,
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

