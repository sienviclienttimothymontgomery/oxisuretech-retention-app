import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    } })
  }

  try {
    const { email, redirectTo } = await req.json()
    
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    const redirectUrl = redirectTo || 'https://oxisuretech-retention-app--oxisuretech-retention-app.us-east4.hosted.app/auth/verify-hash?next=/web/dashboard'

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate the magic link using Admin API (bypasses GoTrue rate limits)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    })

    if (linkError) {
      console.error("Generate link error:", linkError)
      throw new Error(`Failed to generate link: ${linkError.message}`)
    }

    const magicLink = linkData.properties.action_link

    // Send email using Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "OxiSure Tech Tracker <system@oxisuretechsolutions.com>",
        to: email,
        subject: "Your Magic Link - OxiSure Tech",
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; text-align: center; padding: 40px;">
            <div style="background: white; max-width: 400px; margin: 0 auto; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h1 style="color: #1B365D; margin-bottom: 24px;">OxiSure Tech Tracker</h1>
              <p style="margin-bottom: 32px; color: #475569;">Click the button below to securely sign in to your dashboard.</p>
              <a href="${magicLink}" style="background-color: #1B365D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open My Dashboard</a>
              <p style="margin-top: 32px; font-size: 12px; color: #94A3B8;">&copy; 2026 OxiSure Tech Solutions.</p>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error("Resend error:", errorText)
      throw new Error(`Failed to send email via Resend: ${errorText}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    )
  }
})
