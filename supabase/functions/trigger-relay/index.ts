import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Get the RELAY_API_URL from environment
    const RELAY_API_URL = Deno.env.get("RELAY_API_URL");
    
    let hardwareResponse = null;
    
    if (RELAY_API_URL) {
      console.log(`Sending to hardware API: ${RELAY_API_URL}`);
      try {
        // Call your ESP32/Arduino/MQTT hardware API
        const response = await fetch(`${RELAY_API_URL}/relay/${relay_pin}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            pin: relay_pin, 
            state: state ? 1 : 0,
            action: state ? "ON" : "OFF"
          }),
        });
        
        hardwareResponse = await response.text();
        console.log(`Hardware API response: ${hardwareResponse}`);
      } catch (hwError) {
        console.error("Hardware API call failed:", hwError);
        // Continue even if hardware call fails - we still want to update the UI
      }
    } else {
      console.log("RELAY_API_URL not configured - simulating relay trigger");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        relay_pin, 
        state,
        message: `Relay ${relay_pin} set to ${state ? "ON" : "OFF"}`,
        hardware_configured: !!RELAY_API_URL,
        hardware_response: hardwareResponse
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