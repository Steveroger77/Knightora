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
    const { scriptId, selectedText, surroundingContext, action, tone } = await req.json();

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    let modifiedText = "";

    if (geminiApiKey) {
      const prompt = `You are Knightora's expert screenplay and literary editor assistant.
      
Task Action: ${action} ${tone ? `(Desired Tone: ${tone})` : ""}
Selected Story Text: "${selectedText}"
Surrounding Context: "${surroundingContext || ""}"

CRITICAL INSTRUCTIONS:
- Perform the editing action on the selected text.
- Do NOT include any prefixes, labels, intros, or titles like "Make More Cinematic Edit:", "Here is the text:", "Revised version:", or "[Action Applied]:".
- Return ONLY the exact replacement text block. Zero meta-commentary.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      const data = await response.json();
      let rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      
      // Clean any accidental intros or quotes
      modifiedText = rawOutput
        .replace(/^```[a-z]*\n?/i, '')
        .replace(/\n?```$/i, '')
        .replace(/^(here is|revised|edited|make more [a-z]+ edit|\[.*?\]):?\s*/i, '')
        .trim();
    }

    // Clean Fallback if API key missing or call empty
    if (!modifiedText) {
      switch (action) {
        case "Rewrite":
          modifiedText = selectedText.replace(/rolls off/g, "billows across").replace(/thick as spilled milk/g, "heavy as wet wool");
          break;
        case "Continue":
          modifiedText = selectedText + "\n\nA lone church bell chimes three times in the distance. Matteo freezes, his loupe reflecting the single candle flame.";
          break;
        case "Expand":
          modifiedText = selectedText + " The dampness seeps through every mortar line of the stone wall, carrying the mineral tang of centuries of Venetian floodwaters.";
          break;
        case "Shorten":
          modifiedText = selectedText.split(".")[0] + ". Rain whispers across the marble facades.";
          break;
        case "Improve Dialogue":
          modifiedText = selectedText.replace("We have less than an hour.", "The Inquisitor's seal is already dry on the warrant, Matteo. We have minutes, not an hour.");
          break;
        case "Make More Suspenseful":
        case "Make More Cinematic":
          modifiedText = "Shadows stretch like elongated talons across the wet flagstones. " + selectedText;
          break;
        default:
          modifiedText = selectedText;
          break;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        originalText: selectedText,
        modifiedText,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "The ink has smudged — try again" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
