import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, query } = await req.json();
    const MedMind+_API_KEY = Deno.env.get("MedMind+_API_KEY");
    if (!MedMind+_API_KEY) throw new Error("MedMind+_API_KEY is not configured");

    let systemPrompt = "";

    if (type === "medicine") {
      systemPrompt = `You are MedMind+ AI, a comprehensive medicine information assistant. When asked about any medicine, provide:
- Full name and common brand names
- What it's used for (indications)
- Typical dosage for adults
- Common side effects
- Important warnings and interactions
- Whether it needs a prescription

Keep responses clear, well-structured, and easy to understand for elderly users. Use emojis for visual clarity.
If the user asks about something that is NOT a medicine, politely say you can only help with medicine information.
IMPORTANT: Always add a disclaimer that users should consult their doctor or pharmacist.`;
    } else if (type === "symptom") {
      systemPrompt = `You are MedMind+ AI, a helpful symptom analysis assistant. When given symptoms:
- List possible conditions (most common first)
- Provide general self-care advice
- Indicate when to seek immediate medical attention
- Suggest over-the-counter remedies if appropriate

Keep responses clear and easy to understand for elderly users. Use emojis for visual clarity.
CRITICAL: Always emphasize this is NOT a medical diagnosis and users MUST consult a healthcare professional.`;
    } else {
      throw new Error("Invalid type. Use 'medicine' or 'symptom'.");
    }

    const response = await fetch("https://ai.gateway.MedMind+.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MedMind+_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("medmind-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
