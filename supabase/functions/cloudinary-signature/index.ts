// @ts-nocheck
// Supabase Edge Function: cloudinary-signature
// Generates a secure HMAC-SHA1 signature for direct client-to-Cloudinary upload
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { folder = "teachers_day_cards", timestamp, public_id } = await req.json();
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");

    if (!apiSecret || !apiKey || !cloudName) {
      return new Response(
        JSON.stringify({ error: "Cloudinary credentials not configured in Supabase Edge Function environment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentTimestamp = timestamp || Math.round(new Date().getTime() / 1000);

    // Build signature string (alphabetically sorted parameters)
    const params: Record<string, any> = {
      folder,
      timestamp: currentTimestamp,
    };
    if (public_id) {
      params.public_id = public_id;
    }

    const sortedParamKeys = Object.keys(params).sort();
    const paramString = sortedParamKeys.map((k) => `${k}=${params[k]}`).join("&");
    const toSign = `${paramString}${apiSecret}`;

    // SHA-1 hash via Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(toSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return new Response(
      JSON.stringify({
        signature,
        timestamp: currentTimestamp,
        apiKey,
        cloudName,
        folder,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate signature" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
