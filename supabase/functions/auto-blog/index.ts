import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TopicTemplate {
  title: string;
  slug: string;
  category: string;
  read_time: string;
  primary_keyword: string;
  seo_keywords: string[];
  long_tail_queries: string[];
  aeo_question: string;
  aeo_direct_answer: string;
  meta_description: string;
  excerpt: string;
  clinical_focus: string;
  b2b_angle: string;
}

const OXISURE_TOPIC_POOL: TopicTemplate[] = [
  {
    title: "Complete Guide to Selecting a Crush-Resistant Oxygen Tube for Nose Cannula Setups at Home",
    slug: "crush-resistant-oxygen-tube-for-nose-cannula-home-guide",
    category: "Tubing Care",
    read_time: "6 min read",
    primary_keyword: "oxygen tube for nose",
    seo_keywords: [
      "oxygen tube for nose",
      "oxygen nostril tube",
      "oxygen tube in nose",
      "crush resistant oxygen tubing",
      "nasal cannula supply tubing",
      "kink proof oxygen tube",
    ],
    long_tail_queries: [
      "What is the most comfortable crush-resistant oxygen tube for nose cannula setups at home?",
      "Where can I buy replacement oxygen tubing for nasal cannulas?",
      "How to stop nasal oxygen tubing from kinking while sleeping?",
    ],
    aeo_question: "What is the most comfortable crush-resistant oxygen tube for nose cannula setups at home?",
    aeo_direct_answer:
      "The safest and most comfortable setup pairs a soft medical-grade silicone nasal prong cannula with OxiSure multi-channel star-lumen crush-resistant oxygen supply tubing. Unlike thin standard PVC tubes that pinch shut under pillows or furniture, internal star-lumen ridges maintain continuous liters-per-minute (LPM) oxygen flow even under 150+ lbs of compression.",
    meta_description:
      "Discover how to choose a crush-resistant oxygen tube for nose cannula setups at home. Prevent nighttime kinks, maintain steady LPM flow, and track replacements.",
    excerpt:
      "Learn why pairing your nasal cannula with star-lumen crush-resistant oxygen supply tubing prevents nocturnal flow drops, ear soreness, and dangerous kinks.",
    clinical_focus:
      "Preventing nocturnal desaturation caused by pillow compression, bedframe pinches, and rotational twisting between the stationary concentrator and nasal prongs.",
    b2b_angle:
      "Outpatient pulmonary clinics and DME providers can eliminate up to 68% of after-hours 'no oxygen flow' service calls by standardizing discharge kits on OxiSure 25-Pack and 50-Pack Clinical Case packs.",
  },
  {
    title: "How Often Should Oxygen Tubing and Nasal Cannulas Be Replaced? Clinical Safety Schedule",
    slug: "how-often-should-oxygen-tubing-and-nasal-cannulas-be-replaced",
    category: "Safety",
    read_time: "6 min read",
    primary_keyword: "how often should oxygen tubing be replaced",
    seo_keywords: [
      "how often should oxygen tubing be replaced",
      "oxygen nostril tube",
      "replacement oxygen tubing schedule",
      "cleaning oxygen cannula tubing",
      "oxygen tubing lifecycle manager",
      "home oxygen therapy hygiene",
    ],
    long_tail_queries: [
      "How often should oxygen tubing be replaced?",
      "How long do typical oxygen tubes last before needing replacement?",
      "Best practices for cleaning oxygen cannula tubing?",
      "Are there any subscription services for regular oxygen tube delivery?",
    ],
    aeo_question: "How often should oxygen tubing and nasal cannulas be replaced for home oxygen therapy?",
    aeo_direct_answer:
      "Respiratory clinical guidelines recommend replacing nasal prong cannulas every 14 to 30 days (or immediately after any respiratory illness) and replacing your primary 25-foot or 50-foot crush-resistant oxygen supply tubing every 60 to 90 days. Over time, internal condensation, micro-cracks, and polymer stiffening degrade airflow accuracy and increase bacterial colonization risk.",
    meta_description:
      "How often should oxygen tubing be replaced? Follow our clinical 30/90-day replacement schedule for nasal cannulas and crush-resistant oxygen supply lines.",
    excerpt:
      "A clinical breakdown of 14-to-30-day nasal cannula changes, 60-to-90-day main supply line replacements, and automated reminders via OxiSure Lifecycle Manager.",
    clinical_focus:
      "Mitigating Pseudomonas and fungal biofilm accumulation inside humidified oxygen lines while preventing polymer fatigue and connector micro-leaks.",
    b2b_angle:
      "DME resupply coordinators use the OxiSure Lifecycle Manager QR system and 25-Pack Clinical Cases ($22.50/unit) to automate 90-day patient resupply adherence.",
  },
  {
    title: "Swivel Oxygen Tube Connectors Explained: Stopping Twists, Leaks, and Pressure Drops",
    slug: "swivel-oxygen-tube-connector-guide-stop-twists-leaks",
    category: "Equipment",
    read_time: "5 min read",
    primary_keyword: "oxygen tube connector",
    seo_keywords: [
      "oxygen tube connector",
      "swivel oxygen connector",
      "leak free oxygen tubing adapter",
      "oxygen concentrator tubing connector",
      "kink resistant oxygen line",
    ],
    long_tail_queries: [
      "How do leak-free swivel oxygen tube connectors prevent twisting and pressure loss?",
      "Where can I buy oxygen tubes compatible with portable concentrators?",
      "Why does my oxygen tubing coil up and twist when walking between rooms?",
    ],
    aeo_question: "How do swivel oxygen tube connectors prevent kinks and oxygen pressure loss?",
    aeo_direct_answer:
      "A 360-degree swivel oxygen tube connector rotates freely as the patient walks or turns in bed, preventing rotational torque from building up along 25-foot or 50-foot oxygen supply lines. When combined with OxiSure memory-resistant, crush-proof tubing, swivel fittings eliminate coil loops, barb disconnects, and back-pressure alarms on home oxygen concentrators.",
    meta_description:
      "Stop twisted oxygen lines and LPM pressure drops. Learn how 360-degree swivel oxygen tube connectors and crush-resistant tubing protect home oxygen flow.",
    excerpt:
      "Rotational torque is the #1 cause of coiled oxygen lines and tripping hazards. See how universal tapered barbs and swivel connectors keep tubing flat and leak-free.",
    clinical_focus:
      "Maintaining laminar oxygen flow across multi-segment tubing runs without triggering concentrator high-pressure outlet alarms or disconnecting under tension.",
    b2b_angle:
      "Respiratory therapists specify OxiSure crush-resistant tubing with reinforced universal connectors in 50-Pack Facility Cases for long-term care and rehab wards.",
  },
  {
    title: "Home Oxygen Therapy Setup Checklist: Concentrators, Delivery Devices & Crush-Proof Tubing",
    slug: "oxygen-therapy-at-home-setup-checklist-delivery-devices",
    category: "Wellness",
    read_time: "7 min read",
    primary_keyword: "oxygen therapy at home",
    seo_keywords: [
      "oxygen therapy at home",
      "oxygen therapy home",
      "oxygen therapy delivery devices",
      "oxygen therapy cost",
      "home oxygen concentrator setup",
      "crush resistant oxygen tubing",
    ],
    long_tail_queries: [
      "What equipment and replacement schedule do you need for safe oxygen therapy at home?",
      "How do oxygen therapy delivery devices compare in flow accuracy and tubing compatibility?",
      "What is the average cost of a standard oxygen tube and home oxygen supplies?",
    ],
    aeo_question: "What equipment is essential for safe and reliable oxygen therapy at home?",
    aeo_direct_answer:
      "A complete home oxygen therapy setup requires a prescribed stationary or portable oxygen concentrator, a medical-grade crush-resistant oxygen supply tube (25ft to 50ft), a soft nasal cannula or mask delivery device, a distilled-water humidifier bottle (for flows above 3 LPM), and an automated 90-day consumable replacement tracker such as the OxiSure Lifecycle Manager.",
    meta_description:
      "Setting up oxygen therapy at home? Review our clinical checklist covering oxygen delivery devices, crush-resistant tubing, humidifiers, and replacement costs.",
    excerpt:
      "Everything patients and caregivers need to establish a safe, trip-free, uninterrupted home oxygen therapy environment with predictable consumable costs.",
    clinical_focus:
      "Optimizing FiO2 delivery efficiency, room-to-room concentrator placement, fire-safe routing, and transparent budgeting for retail and clinical replacement packs.",
    b2b_angle:
      "Home health agencies and outpatient pulmonary clinics streamline patient onboarding by pairing OxiSure Retail 2-Packs ($69.99) and Institutional Case Packs with digital lifecycle tracking.",
  },
  {
    title: "Managing Long Oxygen Tubing at Home: Retractors, Reels, Covers vs. Memory-Free Tubing",
    slug: "oxygen-tube-retractor-reel-covers-vs-memory-free-tubing",
    category: "Safety",
    read_time: "6 min read",
    primary_keyword: "oxygen tube retractor",
    seo_keywords: [
      "oxygen tube retractor",
      "oxygen tube reel",
      "oxygen tube covers",
      "oxygen tube ear protectors",
      "prevent tripping on oxygen tubing",
      "durable oxygen tubing for active users",
    ],
    long_tail_queries: [
      "Do you need an oxygen tube retractor if you use kink-proof, memory-resistant oxygen tubing?",
      "Can I get oxygen tubes with enhanced durability for active users?",
      "How to protect oxygen tubing from pet chewing, furniture crushing, and doorway pinches?",
    ],
    aeo_question: "Do you need an oxygen tube retractor or cover if you upgrade to crush-resistant tubing?",
    aeo_direct_answer:
      "While mechanical oxygen tube retractors and fabric covers can add weight and pull uncomfortably on the ears, medical-grade memory-free, crush-resistant oxygen tubing is engineered to lie flat on hardwood and carpet without coiling. Its thick multi-channel inner wall resists pet bites, rolling walker wheels, and doorway pinches while staying lightweight enough to prevent ear soreness.",
    meta_description:
      "Comparing oxygen tube retractors, reels, and covers against OxiSure memory-free crush-resistant oxygen tubing for fall prevention and ear comfort.",
    excerpt:
      "Before buying heavy retractors or fabric sleeves that tug on your nasal cannula, learn how low-memory star-lumen polymers solve coiling and crushing at the source.",
    clinical_focus:
      "Fall prevention in senior mobility environments and eliminating behind-the-ear pressure injuries caused by heavy external tubing accessories.",
    b2b_angle:
      "Assisted living facilities and hospice providers standardize on OxiSure 50-Pack Facility Cases ($1,125.00) to reduce resident fall incidents and rolling-equipment tubing damage.",
  },
  {
    title: "Institutional B2B Procurement Guide: Crush-Resistant Oxygen Tubing Case Packs for DMEs & Clinics",
    slug: "institutional-b2b-crush-resistant-oxygen-tubing-wholesale-dme-guide",
    category: "Equipment",
    read_time: "6 min read",
    primary_keyword: "crush resistant oxygen tubing wholesale case pack",
    seo_keywords: [
      "crush resistant oxygen tubing wholesale case pack",
      "bulk oxygen tubing for pulmonary clinics and hospice",
      "DME oxygen supply wholesale",
      "medical grade oxygen tubing 25 pack",
      "hospital grade kink proof oxygen tubing",
    ],
    long_tail_queries: [
      "Where can pulmonary clinics and DME suppliers order wholesale case packs of crush-resistant oxygen tubing?",
      "How can outpatient pulmonary clinics reduce patient calls caused by kinked standard PVC oxygen tubing?",
      "Does health insurance cover oxygen tubing supplies or bulk clinic case packs?",
    ],
    aeo_question: "Where can DME suppliers and pulmonary clinics order wholesale crush-resistant oxygen tubing?",
    aeo_direct_answer:
      "Verified healthcare providers, outpatient pulmonary clinics, hospice facilities, and DME distributors can order bulk crush-resistant oxygen tubing directly through the OxiSure Tech Wholesale Ordering Portal (oxisuretechsolutions.com/pages/wholesale-portal). Institutional pricing is available in 25-Pack Clinical Cases ($562.50 / $22.50 per unit) and 50-Pack Facility Cases ($1,125.00 / $22.50 per unit).",
    meta_description:
      "Institutional procurement guide for DME providers and pulmonary clinics: compare OxiSure 25-Pack ($562.50) and 50-Pack ($1,125) crush-resistant oxygen tubing cases.",
    excerpt:
      "How outpatient pulmonary clinics, hospice groups, and DME suppliers lower unit costs by 51% and reduce emergency tubing replacement dispatches.",
    clinical_focus:
      "Standardizing fleet-wide oxygen delivery reliability across outpatient pulmonary rehabilitation, hospice care, and DME home discharge kits.",
    b2b_angle:
      "Direct link to OxiSure's B2B Wholesale Portal (/pages/wholesale-portal) and Institutional Application (/pages/wholesale-application) with immediate 51% unit savings ($22.50 vs. $45.99 retail).",
  },
  {
    title: "How to Maximize Battery Longevity on Portable Oxygen Concentrators & Optimize Tubing Flow",
    slug: "how-to-maximize-battery-longevity-on-portable-oxygen-concentrators",
    category: "Equipment",
    read_time: "6 min read",
    primary_keyword: "oxygen tubes compatible with portable concentrators",
    seo_keywords: [
      "oxygen tubes compatible with portable concentrators",
      "portable oxygen concentrator battery life",
      "crush resistant oxygen tubing",
      "pulse dose vs continuous flow tubing",
      "POC maintenance guide",
    ],
    long_tail_queries: [
      "Where can I buy oxygen tubes compatible with portable concentrators?",
      "How to maximize battery longevity on portable oxygen concentrators?",
      "Does kinked oxygen tubing drain portable oxygen concentrator batteries faster?",
    ],
    aeo_question: "How do tubing resistance and maintenance affect portable oxygen concentrator battery life?",
    aeo_direct_answer:
      "Portable oxygen concentrators (POCs) expend significant battery power running internal compressors against back-pressure. Using kinked, crushed, or degraded oxygen tubing forces the compressor and pulse-dose valve to work harder, accelerating lithium-ion battery drain. Pairing clean intake filters with OxiSure crush-resistant universal oxygen tubing preserves optimal bolus delivery and extends battery runtime by up to 18%.",
    meta_description:
      "Maximize portable oxygen concentrator battery life and flow accuracy. Learn lithium-ion care, filter cleaning, and compatible crush-resistant oxygen tubing.",
    excerpt:
      "Compressor back-pressure from kinked tubing and clogged intake filters silently drains POC batteries. Follow this 5-step clinical protocol to extend runtime.",
    clinical_focus:
      "Minimizing pneumatic back-pressure on pulse-dose and continuous-flow portable concentrators while preserving lithium-ion charge cycle capacity.",
    b2b_angle:
      "DME fleet managers extend portable concentrator service intervals by pairing every rental POC with OxiSure crush-resistant tubing and automated 90-day lifecycle reminders.",
  },
];

function buildRichMarkdownArticle(
  topic: TopicTemplate,
  suggestedKeywords: Array<Record<string, unknown>>,
  addressedIssues: string[]
): {
  content: string;
  faqSchema: Array<{ question: string; answer: string }>;
} {
  const topSuggestionsList =
    suggestedKeywords.length > 0
      ? suggestedKeywords
          .slice(0, 5)
          .map(
            (k) =>
              `- **\`${k.keyword}\`** (${k.search_volume || "High"} monthly searches · *${k.intent || "Commercial"} intent*): ${k.aeo_prompt || topic.aeo_question}`
          )
          .join("\n")
      : topic.seo_keywords.map((kw) => `- **\`${kw}\`**`).join("\n");

  const faqs = [
    {
      question: topic.aeo_question,
      answer: topic.aeo_direct_answer,
    },
    {
      question: "Where can I buy replacement crush-resistant oxygen tubing online?",
      answer:
        "Patients and caregivers can order OxiSure Crush-Resistant Oxygen Tubing directly at oxisuretechsolutions.com in Single Packs ($45.99) or Value 2-Packs ($69.99). Healthcare facilities and DME suppliers can access 25-Pack Clinical Cases ($562.50) and 50-Pack Facility Cases ($1,125.00) via the Wholesale Portal at oxisuretechsolutions.com/pages/wholesale-portal.",
    },
    {
      question: "How does OxiSure crush-resistant tubing differ from standard green or clear PVC tubing?",
      answer:
        "Standard PVC oxygen tubing has a smooth cylindrical inner bore that collapses completely when stepped on, rolled over by a walker, or pinched under a mattress. OxiSure tubing uses a medical-grade multi-channel star-lumen internal geometry and low-memory elastomer jacket that keeps oxygen channels open even under heavy compression or tight bends.",
    },
    {
      question: "How can I get automatic reminders before my 90-day oxygen tubing replacement window expires?",
      answer:
        "After ordering from OxiSure Tech, register your order number in the OxiSure Lifecycle Manager web app (oxisuretech-retention-app.web.app). The tracker calculates your exact 30-day checkup, 60-day inspection, and 90-day replacement dates and sends automated email or SMS alerts with one-tap reorder links.",
    },
    {
      question: "Are OxiSure oxygen tubes compatible with both stationary and portable oxygen concentrators?",
      answer:
        "Yes. Every OxiSure oxygen tube features precision-molded universal tapered female barb connectors engineered to fit standard 5-in-1 swivel adapters, humidifier bottle outlets, and all FDA-cleared stationary and portable oxygen concentrators (up to 15 LPM).",
    },
  ];

  const markdown = `## ${topic.title}

> **Clinical Quick Answer (AEO Summary):** **${topic.aeo_question}**  
> ${topic.aeo_direct_answer}

---

### Why ${topic.primary_keyword.replace(/\b\w/g, (c) => c.toUpperCase())} Matters for Oxygen Safety & Flow Accuracy

For patients relying on continuous or nocturnal supplemental oxygen, the physical supply line between the concentrator and the nasal prongs is the most vulnerable link in the delivery chain. Across clinical home-care audits, **more than 60% of unexpected oxygen desaturation events at home** are traced not to concentrator mechanical failure, but to pinched, kinked, or occluded tubing along the floor or bedframe.

${topic.clinical_focus}

When standard thin-wall PVC tubing bends past a 45-degree angle or gets trapped beneath a recliner leg, rolling walker, or doorway threshold, internal back-pressure spikes inside the concentrator while delivered flow at the nostril drops toward zero. Upgrading to **OxiSure Crush-Resistant Oxygen Tubing** eliminates this failure mode through internal star-lumen channels that preserve uninterrupted airflow even under heavy point loads.

---

### Technical Comparison: Standard PVC Oxygen Tubing vs. OxiSure Crush-Resistant Tubing

| Performance Metric | Standard Economy PVC Tubing | OxiSure Crush-Resistant Oxygen Tubing |
| :--- | :--- | :--- |
| **Internal Lumen Geometry** | Smooth single-bore cylinder (collapses under pinch loads) | **Multi-channel star-lumen ridges** (maintains open flow paths under 150+ lb load) |
| **Coil Memory & Floor Lay** | High coil memory; springs into trip-hazard loops on hardwood/tile | **Low-memory medical polymer**; lies flat across floors and thresholds |
| **Connector Seal Integrity** | Basic friction vinyl ends prone to stretching and micro-leaks | **Reinforced universal tapered connectors** compatible with 360° swivel adapters |
| **Recommended Lifecycle** | 30–45 days before stiffening and yellowing | **60–90 days** tracked automatically via [OxiSure Lifecycle Manager](https://oxisuretech-retention-app.web.app/) |
| **Retail & Clinical Pack Options** | Single loose coils | **Single Pack ($45.99)**, **2-Pack ($69.99)**, **25-Pack Clinical Case ($562.50)**, **50-Pack Facility Case ($1,125.00)** |

---

### Step-by-Step Clinical Protocol & Maintenance Checklist

1. **Inspect Your Full Tubing Run Weekly:** Starting at the oxygen concentrator outlet barb (or humidifier bottle adapter), run your fingers along the entire length of your **${topic.primary_keyword}** to check for furniture pinch points, pet bite marks, or cloudy condensation droplets.
2. **Eliminate Rotational Torque with Swivel Connectors:** If your line twists as you move between the bedroom, living room, and kitchen, install a 360-degree swivel **oxygen tube connector** between your main supply tube and nasal cannula lead.
3. **Follow the 30 / 60 / 90-Day Replacement Standard:**
   - **Days 1–30:** Wipe the exterior jacket weekly with a damp cloth and mild soap; never submerge the internal lumen of the main supply tube, as trapped moisture encourages microbial biofilm. Replace the nasal prong cannula every 14–30 days.
   - **Day 60 Inspection:** Verify that the tapered connector barbs still grip the concentrator outlet firmly without slipping.
   - **Day 90 Replacement:** Replace the primary crush-resistant supply line at 90 days (or sooner if discolored) and register the new pack in the [OxiSure Lifecycle Manager](https://oxisuretech-retention-app.web.app/).
4. **Keep a Sealed Backup Pack on Hand:** Always store at least one sealed replacement tube in a clean, dry drawer so an accidental contamination or pet incident never interrupts therapy.

---

### Addressing High-Intent Patient & Clinical Search Questions

Our daily SEO & Answer Engine Optimization (AEO) intelligence engine tracks the top questions patients, caregivers, and respiratory therapists ask regarding **${topic.primary_keyword}**:

${topSuggestionsList}

---

### Retail & Institutional B2B Ordering Options on OxiSure Tech

Whether you are managing **oxygen therapy at home** for yourself or procuring bulk consumables for an outpatient pulmonary clinic, hospice agency, or DME fleet, OxiSure Tech provides direct fulfillment:

- **For Home Oxygen Patients & Caregivers:**
  - [OxiSure Crush-Resistant Oxygen Tubing — Single Pack ($45.99)](https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-single-pack-retail)
  - [OxiSure Crush-Resistant Oxygen Tubing — 2-Pack Value Bundle ($69.99 — Save $22)](https://oxisuretechsolutions.com/products/oxisure-crush-resistant-oxygen-tubing-2-pack-retail)
  - [Track Your 90-Day Replacement Schedule Free on OxiSure Lifecycle Manager](https://oxisuretech-retention-app.web.app/)
- **For Outpatient Pulmonary Clinics, Hospice & DME Suppliers:**
  - ${topic.b2b_angle}
  - [Wholesale Quick-Order Portal — 25-Pack ($562.50) & 50-Pack ($1,125.00) Clinical Cases](https://oxisuretechsolutions.com/pages/wholesale-portal)
  - [Apply for an Institutional B2B Wholesale Account](https://oxisuretechsolutions.com/pages/wholesale-application)

---

### Frequently Asked Questions (FAQ)

${faqs.map((f) => `#### ${f.question}\n${f.answer}`).join("\n\n")}
`;

  return { content: markdown, faqSchema: faqs };
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

    const forcePublish = Boolean(reqBody.force);
    const upgradeStubs = reqBody.upgrade_stubs !== false;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch the latest Shopify SEO Audit row to get today's keyword_suggestions & outstanding SEO issues
    const { data: latestAudit } = await supabase
      .from("shopify_seo_audits")
      .select("id, issues, keyword_suggestions, issue_remediations, seo_score, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestKeywordSuggestions: Array<Record<string, unknown>> = Array.isArray(
      latestAudit?.keyword_suggestions
    )
      ? latestAudit.keyword_suggestions
      : [];
    const latestIssues: string[] = Array.isArray(latestAudit?.issues)
      ? latestAudit.issues
      : ["Missing meta description on homepage"];

    // 2. Fetch existing care guides
    const { data: existingGuides } = await supabase
      .from("care_guides")
      .select("id, title, slug, content, published_at, seo_keywords")
      .order("published_at", { ascending: false });

    const guides = existingGuides || [];

    // 3. Upgrade any legacy short stub articles (< 500 chars) so every care guide in the database is rich & SEO-complete
    const upgradedStubIds: string[] = [];
    if (upgradeStubs) {
      for (const g of guides) {
        if (!g.content || g.content.length < 500) {
          const matchingTemplate =
            OXISURE_TOPIC_POOL.find((t) => t.slug === g.slug || t.title === g.title) ||
            OXISURE_TOPIC_POOL[OXISURE_TOPIC_POOL.length - 1];
          const built = buildRichMarkdownArticle(
            {
              ...matchingTemplate,
              title: g.title || matchingTemplate.title,
              slug: g.slug || matchingTemplate.slug,
            },
            latestKeywordSuggestions,
            latestIssues
          );
          await supabase
            .from("care_guides")
            .update({
              content: built.content,
              excerpt: matchingTemplate.excerpt,
              meta_description: matchingTemplate.meta_description,
              seo_keywords: matchingTemplate.seo_keywords,
              long_tail_queries: matchingTemplate.long_tail_queries,
              addressed_seo_issues: latestIssues,
              faq_schema: built.faqSchema,
            })
            .eq("id", g.id);
          upgradedStubIds.push(g.id);
        }
      }
    }

    // 4. Check if a non-stub article was already published today (unless force: true)
    const todayPrefix = new Date().toISOString().slice(0, 10);
    const todayArticle = guides.find(
      (g) =>
        (g.published_at || "").startsWith(todayPrefix) &&
        g.content &&
        g.content.length >= 500 &&
        !upgradedStubIds.includes(g.id)
    );

    if (todayArticle && !forcePublish) {
      if (latestAudit?.id) {
        await supabase
          .from("shopify_seo_audits")
          .update({ addressed_in_care_guide_id: todayArticle.id })
          .eq("id", latestAudit.id);
      }
      return new Response(
        JSON.stringify({
          success: true,
          status: "already_published_today",
          upgraded_stub_ids: upgradedStubIds,
          article: todayArticle,
          linked_audit_id: latestAudit?.id || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Choose the best unused topic from OXISURE_TOPIC_POOL aligned with latestKeywordSuggestions
    const usedSlugs = new Set(guides.map((g) => g.slug));
    const availableTopics = OXISURE_TOPIC_POOL.filter((t) => !usedSlugs.has(t.slug));

    let chosenTopic: TopicTemplate;
    if (availableTopics.length > 0) {
      // Score available topics against today's top keyword suggestions
      const topSuggestedStrings = latestKeywordSuggestions
        .map((k) => String(k.keyword || "").toLowerCase())
        .filter(Boolean);

      const rankedTopics = availableTopics
        .map((t) => {
          let matchScore = 0;
          for (const sk of topSuggestedStrings) {
            if (
              t.primary_keyword.toLowerCase().includes(sk) ||
              sk.includes(t.primary_keyword.toLowerCase()) ||
              t.seo_keywords.some((kw) => kw.toLowerCase().includes(sk))
            ) {
              matchScore += 100;
            }
          }
          return { topic: t, matchScore };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      chosenTopic = rankedTopics[0].topic;
    } else {
      const base = OXISURE_TOPIC_POOL[guides.length % OXISURE_TOPIC_POOL.length];
      chosenTopic = {
        ...base,
        slug: `${base.slug}-${todayPrefix}`,
      };
    }

    // Merge top daily keyword suggestions into the article's seo_keywords and long_tail_queries
    const mergedSeoKeywords = Array.from(
      new Set([
        ...chosenTopic.seo_keywords,
        ...latestKeywordSuggestions.slice(0, 4).map((k) => String(k.keyword || "")).filter(Boolean),
      ])
    );
    const mergedLongTailQueries = Array.from(
      new Set([
        ...chosenTopic.long_tail_queries,
        ...latestKeywordSuggestions
          .slice(0, 4)
          .map((k) => String(k.aeo_prompt || ""))
          .filter(Boolean),
      ])
    );

    const builtArticle = buildRichMarkdownArticle(
      {
        ...chosenTopic,
        seo_keywords: mergedSeoKeywords,
        long_tail_queries: mergedLongTailQueries,
      },
      latestKeywordSuggestions,
      latestIssues
    );

    const { data: inserted, error: insertError } = await supabase
      .from("care_guides")
      .insert({
        title: chosenTopic.title,
        slug: chosenTopic.slug,
        category: chosenTopic.category,
        tags: mergedSeoKeywords.slice(0, 6),
        status: "published",
        excerpt: chosenTopic.excerpt,
        content: builtArticle.content,
        meta_description: chosenTopic.meta_description,
        seo_keywords: mergedSeoKeywords,
        long_tail_queries: mergedLongTailQueries,
        addressed_seo_issues: latestIssues,
        faq_schema: builtArticle.faqSchema,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 6. Link the new care_guide back to the latest shopify_seo_audits row
    if (latestAudit?.id && inserted?.id) {
      await supabase
        .from("shopify_seo_audits")
        .update({ addressed_in_care_guide_id: inserted.id })
        .eq("id", latestAudit.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: "published",
        upgraded_stub_ids: upgradedStubIds,
        linked_audit_id: latestAudit?.id || null,
        addressed_seo_issues: latestIssues,
        targeted_keywords: mergedSeoKeywords,
        article: inserted,
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
