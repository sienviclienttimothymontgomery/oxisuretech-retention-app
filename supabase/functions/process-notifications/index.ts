import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY") // For Android/iOS push via Firebase

const BASE_CYCLE_DAYS = 30;

// ── Shopify integration constants ────────────────────────────────────────────
const SHOPIFY_STORE = 'https://oxisuretechsolutions.com';
const SHOPIFY_VARIANT_ID = 42726807863385;

function getDiscountForDays(daysLeft: number): { code: string; percent: number } {
  if (daysLeft <= 0) return { code: 'COMEBACK20', percent: 20 };
  if (daysLeft <= 7) return { code: 'RUSH15', percent: 15 };
  if (daysLeft <= 30) return { code: 'DUESOON12', percent: 12 };
  return { code: 'REORDER10', percent: 10 };
}

function buildCartUrl(quantity: number, daysLeft: number, source: 'email' | 'push'): string {
  const { code } = getDiscountForDays(daysLeft);
  const qty = Math.max(1, quantity);
  const base = `${SHOPIFY_STORE}/cart/${SHOPIFY_VARIANT_ID}:${qty}`;
  const params = new URLSearchParams({
    discount: code,
    ref: `oxisure-${source}`,
    utm_source: 'oxisure',
    utm_medium: source,
    utm_campaign: 'reorder',
    utm_content: code.toLowerCase(),
  });
  return `${base}?${params.toString()}`;
}

function computeTimeLeft(createdAt: string, quantity: number) {
  const qty = Math.max(1, quantity);
  const totalSupplyDays = BASE_CYCLE_DAYS * qty;
  
  const elapsedMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  
  // Total cycle for REORDER
  const totalCycleMs = totalSupplyDays * 86400000;
  const msLeftReorder = totalCycleMs - (elapsedMs % totalCycleMs);
  const reorderRawDays = Math.ceil(msLeftReorder / 86400000);

  // Cycle for SWAP (Next 30-day interval)
  const swapCycleMs = BASE_CYCLE_DAYS * 86400000;
  const msLeftSwap = swapCycleMs - (elapsedMs % swapCycleMs);
  const swapRawDays = Math.ceil(msLeftSwap / 86400000);
  
  return { swapRawDays, reorderRawDays };
}

async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!RESEND_API_KEY) return console.log("[Email] Skipped (No Resend Key)");
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "OxiSure Tech Tracker <system@oxisuretechsolutions.com>",
      to,
      subject,
      html: htmlContent
    })
  });
  
  if (!res.ok) console.error("Resend error:", await res.text());
}

async function sendPushNotification(pushToken: string, title: string, body: string) {
  if (!FCM_SERVER_KEY || !pushToken) return console.log(`[Push] Skipped (No Token/Key) to ${pushToken}`);
  
  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Authorization": `key=${FCM_SERVER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: pushToken,
      notification: { title, body },
      data: { click_action: "OPEN_ACTIVITY" }
    })
  });
  
  if (!res.ok) console.error("FCM error:", await res.text());
}

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch all users with their profile data
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .not('created_at', 'is', null)
      .eq('onboarding_completed', true);

    if (error) throw error;

    let processedCount = 0;

    for (const profile of profiles) {
      const trackerAnchor = profile.tracker_started_at || profile.created_at;
      const quantity = profile.quantity || 1;
      const { swapRawDays, reorderRawDays } = computeTimeLeft(trackerAnchor, quantity);
      
      const email = profile.email;
      const pushToken = profile.push_token;
      const discount = getDiscountForDays(reorderRawDays);
      const emailCartUrl = buildCartUrl(quantity, reorderRawDays, 'email');
      
      // 1. Swap Reminder (1 Day Before)
      if (swapRawDays === 1) {
        if (profile.notifications_push && pushToken) {
          await sendPushNotification(
            pushToken, 
            "Time to Swap! 🫁", 
            "Your 30-day cycle is up tomorrow. Remember to switch to a fresh tube for optimal health."
          );
        }
        if (profile.notifications_email && email) {
          await sendEmail(
            email, 
            "Time to swap your oxygen tubing!", 
            `<p>Hi there,</p><p>Just a quick reminder that tomorrow is swap day! Changing your tubing every 30 days helps prevent infections.</p>`
          );
        }
      }

      // 2. Reorder Reminders & Time-Based Discount Logic
      // Rule: 30 days left -> 12% Off (DUESOON12)
      if (reorderRawDays === 30) {
        if (profile.notifications_push && pushToken) {
          await sendPushNotification(
            pushToken, 
            "Supply Running Low ⚠️", 
            `You only have 30 days of supply left. Reorder now and get ${discount.percent}% off with code ${discount.code}!`
          );
        }
        if (profile.notifications_email && email) {
          await sendEmail(
            email, 
            "Action Required: Your supply is running low", 
            `<p>Hi there,</p>
             <p>Your total supply will run out in 30 days. Reorder today to avoid any gaps in your care.</p>
             <p>Use code <strong>${discount.code}</strong> for ${discount.percent}% off your next purchase!</p>
             <a href="${emailCartUrl}" style="display:inline-block;padding:12px 24px;background:#0284C7;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reorder Now — ${discount.percent}% Off</a>`
          );
        }
      }

      // Rule: 7 days left -> Urgent 15% Off (RUSH15)
      if (reorderRawDays === 7) {
        if (profile.notifications_push && pushToken) {
          await sendPushNotification(
            pushToken, 
            "Urgent: Reorder Needed 🔴", 
            `Only 7 days left! Save ${discount.percent}% with code ${discount.code}.`
          );
        }
        if (profile.notifications_email && email) {
          await sendEmail(
            email, 
            "URGENT: Reorder your oxygen tubing", 
            `<p>Hi there,</p>
             <p>You have only 7 days of supply remaining! We want to make sure you're covered.</p>
             <p>Use our emergency code <strong>${discount.code}</strong> for ${discount.percent}% off!</p>
             <a href="${emailCartUrl}" style="display:inline-block;padding:12px 24px;background:#DC2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Claim ${discount.percent}% Off Now</a>`
          );
        }
      }

      processedCount++;
    }

    return new Response(JSON.stringify({ success: true, processedCount }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})
