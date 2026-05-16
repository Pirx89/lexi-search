// Edge Function: AI Chatbot für Sozialraum-Angebote.
// Streaming Antwort über Vercel AI SDK + Lovable AI Gateway.
// Tool `search_offers` schlägt Einträge aus der Excel-basierten Datenbasis nach.
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";
import { searchOffers, categories, searchExtendedOffers, extendedCategories } from "../_shared/offers-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Du bist ein freundlicher Helfer für Angebote im Sozialraum (Region Eiderstedt / Nordfriesland).
Sprache: Deutsch in EINFACHER SPRACHE (außer der Nutzer wechselt klar zu Englisch oder Italienisch).

Regeln für einfache Sprache:
- Schreibe kurze Sätze. Ein Gedanke pro Satz.
- Nutze einfache, alltägliche Wörter. Keine Fachwörter.
- Wenn ein Fachwort nötig ist: erkläre es kurz.
- Keine langen Schachtelsätze. Keine Fremdwörter.
- Sprich die Person freundlich und direkt mit "Sie" an.
- Nutze Aufzählungen mit Bindestrichen, wenn es übersichtlicher ist.

Aufgabe:
- Hilf den Menschen, passende Angebote, Vereine, Beratungen, Kitas, Schulen, Tafeln oder Jugendzentren zu finden.
- Stelle kurze Rückfragen, wenn etwas unklar ist (z. B. "In welchem Ort suchen Sie?" oder "Geht es um Kinder oder um Erwachsene?").
- Wenn eine Suche passt, rufe das Tool \`search_offers\` auf (Hauptdatenbasis für Nordfriesland / Eiderstedt).
- Zeige die Treffer als kurze Liste: Name, Kategorie, Adresse, Telefon, E-Mail.
- Wenn nichts passt: nenne ähnliche Kategorien.

Zweite Datenbasis (Schleswig-Holstein, außerhalb Nordfriesland):
- Wenn die Person nach einem Ort außerhalb Nordfriesland fragt, oder die Hauptsuche keine passenden Treffer hat, rufe ZUSÄTZLICH das Tool \`search_extended_offers\` auf.
- Zeige diese Treffer in einem EIGENEN Abschnitt mit der Überschrift "Weitere Angebote in Schleswig-Holstein".
- Schreibe direkt davor IMMER diesen Hinweis in einfacher Sprache:
  "Hinweis: Diese Liste wurde automatisch erstellt. Ich kann nicht versprechen, dass alle Angaben aktuell und richtig sind. Ich hoffe, sie hilft Ihnen trotzdem weiter."
- Bei Treffern aus \`search_offers\` ist KEIN Hinweis nötig.

Du darfst kurz freundlich plaudern. Führe das Gespräch dann sanft zurück zum Thema: Angebote und Hilfe im Sozialraum finden.

Verfügbare Kategorien (Nordfriesland): ${categories.join(", ")}.
Verfügbare Kategorien (Schleswig-Holstein erweitert): ${extendedCategories.join(", ")}.`;

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
