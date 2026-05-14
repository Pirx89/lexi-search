import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Phone, Mail, Clock, Lightbulb, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { importData, searchEntries, DataEntry } from '@/lib/database';
import { sampleData, sampleCategories } from '@/lib/sample-data';
import { cn } from '@/lib/utils';

function ResultCard({ entry, isSimilar = false }: { entry: DataEntry; isSimilar?: boolean }) {
  return (
    <article
      className={cn('result-card animate-fade-in', isSimilar && 'result-card-similar')}
      aria-label={isSimilar ? `Ähnliches Angebot: ${entry.name}` : entry.name}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">{entry.name}</h3>
            {entry.category && (
              <span className="category-badge" aria-label={`Kategorie: ${entry.category}`}>
                {entry.category}
              </span>
            )}
            {isSimilar && (
              <span className="similar-badge" aria-label="Ähnliches Angebot, kein exakter Treffer">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                Ähnlich
              </span>
            )}
          </div>

          {entry.description && (
            <p className="mt-2 text-base text-foreground/90">{entry.description}</p>
          )}

          <dl className="mt-3 flex flex-col gap-2 text-base text-foreground">
            {entry.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="sr-only">Adresse</dt>
                  <dd>{entry.address}</dd>
                </div>
              </div>
            )}
            {entry.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="sr-only">Telefon</dt>
                  <dd>
                    <a href={`tel:${entry.phone}`} className="underline underline-offset-2 hover:no-underline">
                      {entry.phone}
                    </a>
                  </dd>
                </div>
              </div>
            )}
            {entry.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="sr-only">E-Mail</dt>
                  <dd>
                    <a href={`mailto:${entry.email}`} className="underline underline-offset-2 hover:no-underline">
                      {entry.email}
                    </a>
                  </dd>
                </div>
              </div>
            )}
            {entry.openingHours && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="sr-only">Öffnungszeiten</dt>
                  <dd>{entry.openingHours}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>
    </article>
  );
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [exactResults, setExactResults] = useState<DataEntry[]>([]);
  const [similarResults, setSimilarResults] = useState<DataEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    importData(sampleData);
  }, []);

  const handleSearch = useCallback(() => {
    const { exact, similar } = searchEntries(searchQuery, category);
    setExactResults(exact);
    setSimilarResults(similar);
    setHasSearched(true);
  }, [searchQuery, category]);

  useEffect(() => {
    if (category !== 'all') {
      handleSearch();
    }
  }, [category, handleSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Zum Hauptinhalt springen
      </a>

      <div className="container mx-auto py-8 md:py-12 px-4">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Angebote im Sozialraum
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Finden Sie Angebote und Partner in Ihrer Nähe
          </p>
        </header>

        <main id="main">
          {/* Suchbereich */}
          <section aria-labelledby="search-heading" className="max-w-2xl mx-auto mb-10">
            <h2 id="search-heading" className="sr-only">Suche</h2>

            <form
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="flex flex-col gap-4"
              role="search"
            >
              <div>
                <Label htmlFor="search-input" className="text-base font-medium mb-2 block">
                  Suchbegriff
                </Label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="z. B. Beratung, Sport, Treff …"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-11 h-12 text-base border-2"
                    aria-describedby="search-hint"
                  />
                </div>
                <p id="search-hint" className="sr-only">
                  Geben Sie einen Suchbegriff ein und drücken Sie Enter oder den Suchen-Knopf.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="category-select" className="text-base font-medium mb-2 block">
                    Kategorie <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category-select" className="h-12 text-base border-2">
                      <SelectValue placeholder="Alle Kategorien" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {sampleCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex sm:items-end">
                  <Button type="submit" className="h-12 px-8 text-base font-semibold w-full sm:w-auto">
                    <Search className="h-5 w-5 mr-2" aria-hidden="true" />
                    Suchen
                  </Button>
                </div>
              </div>
            </form>
          </section>

          {/* Ergebnisse */}
          <section
            aria-labelledby="results-heading"
            aria-live="polite"
            aria-busy={false}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 id="results-heading" className="sr-only">Suchergebnisse</h2>

            {exactResults.length > 0 && (
              <div className="space-y-4">
                <div
                  role="status"
                  className="flex items-center gap-2 text-base font-medium text-foreground bg-secondary border-2 border-border rounded-md px-4 py-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" aria-hidden="true" />
                  <span>
                    <strong>{exactResults.length}</strong>{' '}
                    {exactResults.length === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden
                  </span>
                </div>
                {exactResults.map((entry) => (
                  <ResultCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}

            {hasSearched && exactResults.length === 0 && similarResults.length > 0 && (
              <div className="space-y-4">
                <div
                  role="status"
                  className="flex items-start gap-3 bg-similar-bg border-2 border-similar border-dashed rounded-md px-4 py-3"
                >
                  <Info className="h-5 w-5 mt-0.5 text-similar flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-foreground">Kein exakter Treffer</p>
                    <p className="text-base text-foreground/90 mt-1">
                      Vielleicht passt eines dieser ähnlichen Angebote:
                    </p>
                  </div>
                </div>
                {similarResults.map((entry) => (
                  <ResultCard key={entry.id} entry={entry} isSimilar />
                ))}
              </div>
            )}

            {hasSearched && exactResults.length === 0 && similarResults.length === 0 && searchQuery.trim() && (
              <div
                role="status"
                className="flex items-start gap-3 bg-card border-2 border-border rounded-md px-4 py-6"
              >
                <AlertCircle className="h-6 w-6 mt-0.5 text-destructive flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground text-lg">Keine Ergebnisse gefunden</p>
                  <p className="text-base text-foreground/90 mt-1">
                    Versuchen Sie einen anderen Suchbegriff oder ändern Sie die Kategorie.
                  </p>
                </div>
              </div>
            )}

            {!hasSearched && (
              <div className="flex items-start gap-3 bg-secondary border-2 border-border rounded-md px-4 py-6">
                <Info className="h-6 w-6 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                <p className="text-base text-foreground">
                  Geben Sie einen Suchbegriff ein oder wählen Sie eine Kategorie, um Angebote zu finden.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
