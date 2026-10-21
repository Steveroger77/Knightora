import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { scriptContent } = await req.json();
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    let extractedData = null;

    if (geminiApiKey && scriptContent) {
      const prompt = `You are an expert Story Analyst & Story Bible Extractor.
Analyze the following manuscript story text carefully. Identify and extract ALL actual Characters, Locations, Props, Relationships, and Timeline Events that appear in this story text.
Do NOT output fake or generic placeholder names. Only output entities present in or directly inferred from the provided story text.

Story Text:
${typeof scriptContent === "string" ? scriptContent.slice(0, 20000) : JSON.stringify(scriptContent)}

Return strictly valid JSON with this exact schema:
{
  "characters": [
    { "name": "", "description": "", "age": "", "gender": "", "occupation": "", "appearance": "", "personality": "" }
  ],
  "locations": [
    { "name": "", "description": "", "atmosphere": "", "time_of_day": "", "weather": "" }
  ],
  "props": [
    { "name": "", "description": "", "owner": "", "status": "" }
  ],
  "relationships": [
    { "character_a": "", "character_b": "", "type": "friend|enemy|sibling|mentor|student|parent|lover|business_partner|unknown", "description": "" }
  ],
  "timeline_events": [
    { "day_or_date": "", "title": "", "description": "" }
  ]
}`;

      const response = await fetch(
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

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          extractedData = JSON.parse(rawText);
        }
      }
    }

    if (!extractedData) {
      return new Response(
        JSON.stringify({ success: false, extracted: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, extracted: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Extraction error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
