import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { relay_pin, state } = await req.json();

    if (!relay_pin || typeof relay_pin !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid relay_pin" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (relay_pin < 1 || relay_pin > 1000) {
      return new Response(
        JSON.stringify({ error: "relay_pin must be between 1 and 1000" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the relay trigger event
    console.log(`Relay ${relay_pin} triggered: ${state ? "ON" : "OFF"}`);

    // Here you would integrate with your actual relay hardware/API
    // For example:
    // - Send to MQTT broker
    // - Call your ESP32/Arduino API
    // - Trigger webhook to your relay controller
    
    // Example placeholder for hardware integration:
    // const RELAY_API_URL = Deno.env.get("RELAY_API_URL");
    // if (RELAY_API_URL) {
    //   await fetch(`${RELAY_API_URL}/relay/${relay_pin}`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ state }),
    //   });
    // }

    return new Response(
      JSON.stringify({ 
        success: true, 
        relay_pin, 
        state,
        message: `Relay ${relay_pin} set to ${state ? "ON" : "OFF"}` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error triggering relay:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});