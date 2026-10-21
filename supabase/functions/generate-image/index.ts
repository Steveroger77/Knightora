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
    const {
      projectId,
      sceneId,
      characterId,
      locationId,
      category: passedCategory,
      characterName = "",
      characterAppearance = "",
      characterSeed = null,
      locationName = "",
      locationDetails = "",
      storyText = "",
      stylePreset = "Cinematic",
      cameraAngle = "Medium Shot",
      lens = "50mm",
      lighting = "Golden Hour",
      weather = "Clear",
      timeOfDay = "Sunset",
      mood = "Dramatic",
      colorPalette = "Warm",
      aspectRatio = "16:9",
      steps = 4,
    } = await req.json();

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const cfAccountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    const cfApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");

    let finalPrompt = "";

    // Assemble character & location consistency anchors
    let consistencyAnchor = "";
    if (characterName || characterAppearance) {
      consistencyAnchor += `Strict Character Consistency: Subject is ${characterName || "the character"}. Physical traits: ${characterAppearance || "distinctive facial features, hair style, build"}. Maintain exact face structure, eyes, and hair. `;
    }
    if (locationName || locationDetails) {
      consistencyAnchor += `Location Setting: ${locationName || "the setting"}. Environment details: ${locationDetails || "distinct architectural and atmospheric traits"}. `;
    }

    // 1. Refine prompt with Gemini if key available
    if (geminiApiKey && storyText) {
      const gPrompt = `You are an expert film director and concept artist prompt generator.
Convert this story excerpt into a vivid visual image generation prompt for FLUX.1 Schnell:
"${storyText}"

${consistencyAnchor ? `CRITICAL CONSISTENCY INSTRUCTION: ${consistencyAnchor}` : ""}
Style Preset: ${stylePreset}
Camera Angle: ${cameraAngle}
Lens: ${lens}
Lighting: ${lighting}
Mood: ${mood}

Ensure character facial features, hair, eye color, and location architecture remain strictly consistent.
Output ONLY the final detailed visual description prompt text, no intro text.`;

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
      finalPrompt = `${stylePreset} visual of ${consistencyAnchor ? `${consistencyAnchor} ` : ""}${storyText || "cinematic scene"}, ${cameraAngle}, ${lens} lens, ${lighting} lighting, ${timeOfDay}, ${weather}, ${mood} atmosphere, ${colorPalette} palette, 8k resolution detailed textures`;
    }

    // Determine dimensions from aspect ratio
    let width = 1024;
    let height = 576; // 16:9 default
    if (aspectRatio === "1:1") { width = 768; height = 768; }
    else if (aspectRatio === "9:16") { width = 576; height = 1024; }
    else if (aspectRatio === "2.39:1") { width = 1024; height = 432; }

    let imageUrl = "";

    // Determine deterministic seed for character consistency if provided
    const imageSeed = characterSeed || (characterId ? Math.abs(characterId.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) * 1009) % 1000000 : Math.floor(Math.random() * 1000000));

    // 2. Call Cloudflare Workers AI FLUX.1 Schnell if credentials available
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

    // Fallback prompt-driven URL with seed locking for character consistency
    if (!imageUrl) {
      const cleanPrompt = `${stylePreset} artwork, ${finalPrompt}`.replace(/[^a-zA-Z0-9 ,]/g, '');
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?seed=${imageSeed}&width=${width}&height=${height}&nologo=true`;
    }

    // Compute category automatically if not explicitly passed
    let category = passedCategory || "General";
    if (!passedCategory) {
      if (characterId || characterName) category = "Character";
      else if (locationId || locationName) category = "Location";
      else if (sceneId) category = "Scene";
      else {
        const lowerPrompt = finalPrompt.toLowerCase();
        if (lowerPrompt.includes("portrait") || lowerPrompt.includes("character") || lowerPrompt.includes("person") || lowerPrompt.includes("face")) {
          category = "Character";
        } else if (lowerPrompt.includes("room") || lowerPrompt.includes("building") || lowerPrompt.includes("landscape") || lowerPrompt.includes("exterior") || lowerPrompt.includes("interior") || lowerPrompt.includes("city")) {
          category = "Location";
        } else if (lowerPrompt.includes("scene") || lowerPrompt.includes("action") || lowerPrompt.includes("shot")) {
          category = "Scene";
        }
      }
    }

    // 3. Compute neuron cost
    const tilesX = Math.ceil(width / 512);
    const tilesY = Math.ceil(height / 512);
    const totalTiles = tilesX * tilesY;
    const estimatedNeurons = Math.round((totalTiles * 4.8) + (steps * 9.6));

    const imageRecord = {
      id: crypto.randomUUID(),
      project_id: projectId,
      scene_id: sceneId || null,
      character_id: characterId || null,
      location_id: locationId || null,
      category,
      image_url: imageUrl,
      prompt: finalPrompt,
      style_preset: stylePreset,
      camera_angle: cameraAngle,
      lens,
      lighting,
      weather,
      time_of_day: timeOfDay,
      mood,
      color_palette: colorPalette,
      aspect_ratio: aspectRatio,
      steps,
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        record: imageRecord,
        neuronsUsed: estimatedNeurons,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Image generation smudged" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
