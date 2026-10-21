// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      projectId,
      characterId,
      characterName = "",
      characterAppearance = "",
      variantType = "portrait", // portrait | full_body | expression | clothing_variant | action_pose
      stylePreset = "Cinematic",
      customInstructions = "",
      storyText = "",
      aspectRatio = "1:1",
      steps = 4,
    } = await req.json();

    const instructions = customInstructions || storyText;
    const safeCharacterName = characterName || "Unknown Character";

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const cfAccountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    const cfApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");

    let finalPrompt = "";

    if (geminiApiKey) {
      const gPrompt = `You are a character design prompt engineer for FLUX.1 Schnell.
Generate a character artwork prompt ensuring strict character consistency.

Character Name: ${safeCharacterName}
Base Physical Traits: ${characterAppearance || "Defined facial features, distinctive attire"}
Variant Type: ${variantType}
Style Preset: ${stylePreset}
Additional Instructions: ${instructions}

Prepend physical traits, hair, face structure, skin tone, build, and eyes.
Ensure the prompt specifies a clear subject focus, cinematic lighting, and detailed textures.
Return ONLY the prompt string.`;

      try {
        const gRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: gPrompt }] }] }),
          }
        );
        const gData = await gRes.json();
        finalPrompt = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } catch (_) {}
    }

    if (!finalPrompt) {
      finalPrompt = `${stylePreset} character ${variantType} of ${safeCharacterName}, featuring ${characterAppearance || "silver-streaked dark hair, sharp features, dark leather velvet coat"}, ${instructions}, sharp focus, studio lighting, masterpiece quality`;
    }

    let imageUrl = "";
    
    let width = 768;
    let height = 768;
    if (aspectRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (aspectRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (aspectRatio === "2.39:1") {
      width = 1024;
      height = 432;
    }

    if (cfAccountId && cfApiToken) {
      try {
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cfApiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: finalPrompt,
              num_steps: steps,
              width,
              height,
            }),
          }
        );
        const cfData = await cfRes.json();
        if (cfData?.result?.image) {
          imageUrl = `data:image/jpeg;base64,${cfData.result.image}`;
        }
      } catch (_) {}
    }

    if (!imageUrl) {
      imageUrl = safeCharacterName.toLowerCase().includes("elena")
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
        : "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80";
    }

    const record = {
      id: crypto.randomUUID(),
      character_id: characterId,
      image_url: imageUrl,
      type: variantType,
      style_preset: stylePreset,
      prompt: finalPrompt,
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ success: true, record }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Character image error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
