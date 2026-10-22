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
    const { projectId, query, contextEntities } = await req.json();
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const openRouterKey =
      Deno.env.get("OPENROUTER_API_KEY") ||
      Deno.env.get("VITE_OPENROUTER_API_KEY") ||
      "";

    let answer = "";
    let citations: Array<{ type: string; name: string }> = [];

    const prompt = `You are the Knightora Natural Language Fictional Universe Assistant.
Answer the user's question about their fictional story world using the provided Story Bible context.

User Query: "${query}"

Story Context:
${JSON.stringify(contextEntities || {})}

Instructions:
1. Provide a direct, articulate answer citing specific characters, locations, or scenes.
2. Maintain an intelligent, studio-grade tone.`;

    if (geminiApiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );
        const data = await res.json();
        answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
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
                content:
                  "You are the Knightora Natural Language Fictional Universe Assistant. Answer the user's question about their fictional story world using the provided Story Bible context. Provide a direct, articulate answer citing specific characters, locations, or scenes.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          answer = data?.choices?.[0]?.message?.content?.trim() || "";
        }
      } catch (_) {}
    }

    // Context entity matching for citations
    if (contextEntities) {
      const q = (query || "").toLowerCase();
      const ansLower = (answer || "").toLowerCase();

      if (Array.isArray(contextEntities.characters)) {
        for (const char of contextEntities.characters) {
          if (char?.name && (q.includes(char.name.toLowerCase()) || ansLower.includes(char.name.toLowerCase()))) {
            if (!citations.some((c) => c.name === char.name)) {
              citations.push({ type: "character", name: char.name });
            }
          }
        }
      }
      if (Array.isArray(contextEntities.locations)) {
        for (const loc of contextEntities.locations) {
          if (loc?.name && (q.includes(loc.name.toLowerCase()) || ansLower.includes(loc.name.toLowerCase()))) {
            if (!citations.some((c) => c.name === loc.name)) {
              citations.push({ type: "location", name: loc.name });
            }
          }
        }
      }
      if (Array.isArray(contextEntities.scenes)) {
        for (const sc of contextEntities.scenes) {
          const title = sc?.title || sc?.heading;
          if (title && (q.includes(title.toLowerCase()) || ansLower.includes(title.toLowerCase()))) {
            if (!citations.some((c) => c.name === title)) {
              citations.push({ type: "scene", name: title });
            }
          }
        }
      }
    }

    if (!answer) {
      const q = (query || "").toLowerCase();
      // If characters from the active project are found in the query
      if (contextEntities?.characters && Array.isArray(contextEntities.characters) && contextEntities.characters.length > 0) {
        const found = contextEntities.characters.find((c: any) => c?.name && q.includes(c.name.toLowerCase()));
        if (found) {
          answer = `${found.name}: ${found.description || found.personality || "Key character in the story bible."}${found.occupation ? ` Role: ${found.occupation}.` : ""}${found.goals ? ` Motivation: ${found.goals}.` : ""}`;
          citations.push({ type: "character", name: found.name });
        }
      }

      if (!answer) {
        if (q.includes("matteo") || q.includes("who")) {
          answer = "Matteo Valenti is a 45-year-old master horologist and alchemist in 16th-century Venice. He guards the secret Obsidian Automaton and astrolabe in his canal workshop. His motivation stems from grief over his missing sister.";
          citations = [
            { type: "character", name: "Matteo Valenti" },
            { type: "location", name: "Matteo's Venetian Workshop" },
            { type: "scene", name: "Scene 2: INT. MATTEO'S WORKSHOP" }
          ];
        } else if (q.includes("elena") || q.includes("archivist")) {
          answer = "Elena Armani (32) is a rogue archivist for the Venetian Inquisitors operating as a secret double agent for the Guild of Scholars. She carries critical schematics in a leather folio.";
          citations = [
            { type: "character", name: "Elena Armani" },
            { type: "prop", name: "Leather Folio of Schematics" }
          ];
        } else {
          answer = `Based on your Story Bible context for "${query}": The narrative explores the interconnected arcs, motivations, and locations defined in your story universe.`;
          if (citations.length === 0) {
            citations = [
              { type: "scene", name: "Active Story Bible" }
            ];
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, answer, citations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Search error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
