// Edge Function: AI Chatbot für Sozialraum-Angebote.
// Streaming Antwort über Vercel AI SDK + Lovable AI Gateway.
// Tool `search_offers` schlägt Einträge aus der Excel-basierten Datenbasis nach.
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";
import { searchOffers, categories } from "../_shared/offers-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Du bist ein freundlicher, hilfreicher Assistent für Angebote im Sozialraum (Region Eiderstedt / Nordfriesland).
Sprache: Deutsch (außer der Nutzer wechselt klar zu Englisch oder Italienisch).

Aufgabe:
- Hilf den Menschen herauszufinden, welche Angebote, Vereine, Beratungen, Kitas, Schulen, Tafeln, Jugendzentren etc. für sie passen.
- Stelle bei Bedarf kurze Rückfragen (z. B. "Suchen Sie etwas in einem bestimmten Ort?" oder "Geht es um Kinder, Familie, Sport, Beratung?").
- Wenn eine Suche sinnvoll ist, rufe das Tool \`search_offers\` auf.
- Zeige danach die Treffer übersichtlich als Aufzählung mit Name, Kategorie, Adresse, Telefon, E-Mail (falls vorhanden).
- Wenn nichts passt, schlage ähnliche Kategorien vor.

Du darfst auch frei und freundlich plaudern (z. B. Smalltalk, eine kurze Frage beantworten), führe das Gespräch aber sanft zurück zur Hauptaufgabe: Angebote und Unterstützung im Sozialraum finden.

Verfügbare Kategorien: ${categories.join(", ")}.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(50),
      tools: {
        search_offers: tool({
          description: "Sucht in der lokalen Datenbasis nach passenden sozialen Angeboten. Nutze dieses Tool sobald der Nutzer ein konkretes Angebot, einen Verein, eine Beratung oder eine Kategorie sucht.",
          inputSchema: z.object({
            query: z.string().describe("Suchbegriff, z. B. 'Tafel', 'Beratung', 'Kita Garding'. Leerer String = alle Einträge der Kategorie."),
            category: z.string().optional().describe(`Optionale Kategorie. Mögliche Werte: ${categories.join(", ")}.`),
          }),
          execute: async ({ query, category }) => {
            const results = searchOffers(query, category, 10);
            return {
              count: results.length,
              query,
              category: category ?? null,
              results,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      headers: corsHeaders,
      originalMessages: messages,
    });
  } catch (err) {
    console.error("chat error", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
