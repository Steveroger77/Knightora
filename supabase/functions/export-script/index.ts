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
    const { scriptId, title, format = "screenplay", exportType = "pdf" } = await req.json();

    // Generates export output data URL or download payload
    const filename = `${(title || "script").toLowerCase().replace(/[^a-z0-9]/g, "_")}.${exportType}`;
    const mockDownloadUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(`KNIGHTORA EXPORT\nTitle: ${title}\nFormat: ${format}\nExport Type: ${exportType}\n\nEXT. GRAND CANAL - VENICE - NIGHT\nFog thick as spilled milk rolls off the dark lagoon...`)}`;

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        format,
        exportType,
        downloadUrl: mockDownloadUrl,
        expiresInSeconds: 3600,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Export error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
