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
    const { messages, prompt } = await req.json();

    const openRouterKey =
      Deno.env.get("OPENROUTER_API_KEY") ||
      Deno.env.get("VITE_OPENROUTER_API_KEY") ||
      "";

    // Format messages into OpenAI-compatible format
    const formattedMessages = (messages || []).map((msg: any) => ({
      role: msg.role === "user" || msg.sender === "user" ? "user" : "assistant",
      content: msg.content || msg.text || "",
    }));

    if (prompt) {
      const lastMsg = formattedMessages[formattedMessages.length - 1];
      if (!lastMsg || lastMsg.role !== "user" || lastMsg.content !== prompt) {
        formattedMessages.push({
          role: "user",
          content: prompt,
        });
      }
    }

    const conversationMessages = [
      {
        role: "system",
        content: "You are a helpful conversational assistant. Answer naturally, intelligently, accurately, and directly.",
      },
      ...formattedMessages,
    ];

    const payload = {
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 2048,
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey.trim()}`,
        "HTTP-Referer": "https://yourdomain.com",
        "X-Title": "Skipper",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `OpenRouter API returned status ${response.status}`;
      return new Response(
        JSON.stringify({
          success: false,
          error: `OpenRouter API Error: ${errorMessage}`,
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OpenRouter API returned an empty response.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        text,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unexpected server error calling OpenRouter API.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
