// Edge Function: Übersetzt Text in eine Zielsprache via Lovable AI Gateway.
import { generateText } from "npm:ai";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "Englisch",
  ru: "Russisch",
  tr: "Türkisch",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, targetLang } = await req.json() as { text: string; targetLang: string };
    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: "Missing text or targetLang" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Quick no-op: gleiche Zielsprache
    const langName = LANG_NAMES[targetLang] ?? targetLang;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-2.5-flash");

    const { text: translated } = await generateText({
      model,
      system:
        `Du bist ein professioneller Übersetzer. Übersetze den folgenden Text in ${langName}. ` +
        "Behalte Eigennamen, Telefonnummern, E-Mails und Adressen unverändert bei. " +
        "Antworte AUSSCHLIESSLICH mit dem übersetzten Text, ohne Einleitung, ohne Anführungszeichen, ohne Erklärungen.",
      prompt: text,
    });

    return new Response(JSON.stringify({ text: translated.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("translate error", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
