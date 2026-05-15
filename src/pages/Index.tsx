import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ToolUIPart } from "ai";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
} from "@/components/ai-elements/tool";
import { MapPin, Phone, Mail, Clock, MessagesSquare, Search, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type OfferResult = {
  id: number;
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  description?: string;
};

function OffersResultCard({ data }: { data: { count: number; query: string; category: string | null; results: OfferResult[] } }) {
  if (!data.results?.length) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Keine Treffer für „{data.query}"{data.category ? ` in Kategorie ${data.category}` : ""}.
      </div>
    );
  }
  return (
    <div className="space-y-3 my-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Search className="h-4 w-4 text-primary" aria-hidden="true" />
        {data.count} {data.count === 1 ? "Angebot" : "Angebote"} gefunden
        {data.category ? <span className="text-muted-foreground">· Kategorie: {data.category}</span> : null}
      </div>
      <ul className="space-y-2">
        {data.results.map((o) => (
          <li key={o.id} className="rounded-lg border-2 border-border bg-card p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{o.name}</h4>
              {o.category && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                  {o.category}
                </span>
              )}
            </div>
            {o.description && <p className="text-sm text-foreground/90 mt-1">{o.description}</p>}
            <dl className="mt-2 space-y-1 text-sm text-foreground">
              {o.address && (
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary" aria-hidden="true" /><dd>{o.address}</dd></div>
              )}
              {o.phone && (
                <div className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-primary" aria-hidden="true" /><dd><a className="underline underline-offset-2" href={`tel:${o.phone}`}>{o.phone}</a></dd></div>
              )}
              {o.email && (
                <div className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-primary" aria-hidden="true" /><dd><a className="underline underline-offset-2" href={`mailto:${o.email}`}>{o.email}</a></dd></div>
              )}
              {o.openingHours && (
                <div className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 text-primary" aria-hidden="true" /><dd>{o.openingHours}</dd></div>
              )}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Index = () => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Custom transport that includes the Supabase anon key (function has verify_jwt=false but
  // the edge runtime still expects an apikey header on most setups).
  const transport = new DefaultChatTransport({
    api: FUNCTION_URL,
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  const { messages, sendMessage, status, error } = useChat({
    transport,
    onError(err) {
      console.error("Chat error:", err);
      toast({
        title: "Fehler beim Chat",
        description: err.message || "Bitte später erneut versuchen.",
        variant: "destructive",
      });
    },
  });

  // Focus the textarea on mount, after each send, and after streaming finishes.
  useEffect(() => {
    if (status === "ready" || status === undefined) {
      textareaRef.current?.focus();
    }
  }, [status]);

  const handleSubmit = async (
    _msg: unknown,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    setInput("");
    await sendMessage({ text });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Zum Hauptinhalt springen
      </a>

      <header className="border-b-2 border-border bg-card">
        <div className="container mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <MessagesSquare className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">Sozialraum-Assistent</h1>
            <p className="text-sm text-muted-foreground">Fragen Sie nach Angeboten, Vereinen oder Beratungen</p>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 flex flex-col container mx-auto max-w-3xl w-full px-4 py-4 min-h-0">
        <Conversation className="flex-1 min-h-0 rounded-lg border-2 border-border bg-card">
          <ConversationContent>
            {messages.length === 0 && (
              <ConversationEmptyState
                icon={<MessagesSquare className="h-10 w-10 text-primary" aria-hidden="true" />}
                title="Wonach suchen Sie?"
                description={'Sagen Sie z. B. „Ich suche eine Tafel in der Nähe", „Gibt es eine Kita in Garding?" oder „Beratung für Familien".'}
              />
            )}

            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, idx) => {
                    if (part.type === "text") {
                      return message.role === "assistant" ? (
                        <MessageResponse key={idx}>{part.text}</MessageResponse>
                      ) : (
                        <span key={idx}>{part.text}</span>
                      );
                    }

                    // Tool parts: search_offers
                    if (part.type === "tool-search_offers" || part.type?.startsWith("tool-")) {
                      const toolPart = part as ToolUIPart;
                      const output = toolPart.state === "output-available" ? toolPart.output : null;
                      return (
                        <div key={idx} className="w-full">
                          <Tool defaultOpen={false}>
                            <ToolHeader
                              type={toolPart.type as ToolUIPart["type"]}
                              state={toolPart.state}
                              title="Angebote suchen"
                            />
                            <ToolContent>
                              {toolPart.input ? <ToolInput input={toolPart.input} /> : null}
                            </ToolContent>
                          </Tool>
                          {output && typeof output === "object" && "results" in (output as object) ? (
                            <OffersResultCard data={output as never} />
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))}

            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer>Denke nach …</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="mt-3">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Schreiben Sie Ihre Frage …"
              disabled={isLoading}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() || isLoading} />
            </PromptInputFooter>
          </PromptInput>
          {error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error.message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
