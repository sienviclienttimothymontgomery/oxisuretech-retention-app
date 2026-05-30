import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// Edge Function to verify a Shopify Order ID.
// In production, this would connect to Shopify Admin API.
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    } })
  }

  try {
    const { orderId } = await req.json()
    
    if (!orderId) {
      return new Response(JSON.stringify({ success: false, error: "Order ID is required" }), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    // Shopify order format: numbers, or a prefix like OXI-1234, or #1234
    const isShopify = /^#?(\d+|OXI-\d+)$/i.test(orderId.trim());

    if (!isShopify) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid Order ID format. Please enter your Shopify order number (e.g. #1234 or OXI-1234)." 
        }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      )
    }

    // TODO: Actually fetch the order from Shopify Admin API to ensure it contains Oxygen Tubing
    // For now, we mock a successful verification if the format is correct
    
    // Artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 1200));

    return new Response(
      JSON.stringify({ 
        success: true,
        platform: 'shopify',
        product: 'OxiSure Oxygen Tubing'
      }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    )
  }
})
