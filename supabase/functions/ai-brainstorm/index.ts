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
    const { projectId, brainstormType, context } = await req.json();
    // brainstormType: Plot Twists | Alternative Endings | Character Ideas | Dialogue Ideas | Fight Scenes | Mysteries | World Building | Story Hooks

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const openRouterKey =
      Deno.env.get("OPENROUTER_API_KEY") ||
      Deno.env.get("VITE_OPENROUTER_API_KEY") ||
      "";

    let ideas = [];

    const prompt = `You are a creative brainstorming engine for Knightora.
Brainstorm 3 creative, high-concept ideas of category "${brainstormType}" based on this story context:

Context: ${context || "Gothic Venetian alchemical thriller with mechanical memory automata"}

Return JSON array of strings:
["Idea 1...", "Idea 2...", "Idea 3..."]`;

    if (geminiApiKey) {
      try {
        const res = await fetch(
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
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          ideas = JSON.parse(rawText);
        }
      } catch (_) {}
    } else if (openRouterKey) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey.trim()}`,
            "HTTP-Referer": "https://knightora.app",
            "X-Title": "Knightora",
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-ultra-550b-a55b:free",
            messages: [
              {
                role: "system",
                content: "You are a creative brainstorming engine for Knightora. Return strictly a JSON array of 3 string ideas.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 512,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const rawText = data?.choices?.[0]?.message?.content?.trim();
          if (rawText) {
            const cleaned = rawText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
            ideas = JSON.parse(cleaned);
          }
        }
      } catch (_) {}
    }

    if (!ideas || ideas.length === 0) {
      switch (brainstormType) {
        case "Plot Twists":
          ideas = [
            "The brass mechanical sparrow is not storing an alchemical formula—it contains the projected consciousness of Matteo's lost sister.",
            "Elena's leather folio does not hold schematics, but an execution list bearing Matteo's own name signed by the Guild Master.",
            "The Doge of Venice is secretly an early automaton built by Matteo's grandfather forty years prior."
          ];
          break;
        case "World Building":
          ideas = [
            "The Submerged Arsenal: A underwater clockwork foundry beneath San Marco accessible only during lunar spring tides.",
            "Memory Glass: Blown Murano glass retorts capable of trapping vocal frequencies when heated with sulfur resin.",
            "The Guild of Silent Gearsmiths: A secretive order of mute Venetian craftsmen who communicate via mechanical hand cyphers."
          ];
          break;
        default:
          ideas = [
            "A confrontation on the flooded Rialto bridge during a midnight thunderstorms.",
            "An intricate cipher lock on the workshop vault requiring three synchronized musical tones.",
            "A sudden betrayal when Elena reveals she was followed across the lagoon."
          ];
          break;
      }
    }

    return new Response(
      JSON.stringify({ success: true, brainstormType, ideas }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Brainstorming error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
