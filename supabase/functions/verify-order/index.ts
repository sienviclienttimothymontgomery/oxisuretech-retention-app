import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// Basic Edge Function to verify an Amazon or Shopify Order ID
// In production, this would connect to Shopify Admin API and Amazon SP-API.
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

    // Determine platform and validate format
    // Amazon format: 111-1234567-1234567 (3 digits - 7 digits - 7 digits)
    const isAmazon = /^\d{3}-\d{7}-\d{7}$/.test(orderId);
    
    // Shopify format mock: usually numbers or a prefix like OXI-1234
    const isShopify = /^(OXI-)?\d+$/i.test(orderId);

    if (!isAmazon && !isShopify) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid Order ID format. Please use a valid Amazon (e.g. 111-1234567-1234567) or Shopify order number." 
        }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      )
    }

    // TODO: Actually fetch the order from Shopify/Amazon SP-API to ensure it contains Oxygen Tubing
    // For now, we mock a successful verification if the format is correct
    
    // Artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 1200));

    return new Response(
      JSON.stringify({ 
        success: true,
        platform: isAmazon ? 'amazon' : 'shopify',
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
