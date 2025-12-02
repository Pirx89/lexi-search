import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Phone, Mail, Clock, Lightbulb } from 'lucide-react';
import { importData, searchEntries, DataEntry } from '@/lib/database';
import { sampleData, sampleCategories } from '@/lib/sample-data';
import { cn } from '@/lib/utils';

function ResultCard({ entry, isSimilar = false }: { entry: DataEntry; isSimilar?: boolean }) {
  return (
    <div className={cn("result-card animate-fade-in", isSimilar && "result-card-similar")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-foreground">{entry.name}</h3>
            {entry.category && (
              <span className={cn("category-badge", isSimilar && "bg-similar/10 text-similar")}>
                {entry.category}
              </span>
            )}
            {isSimilar && (
              <span className="similar-badge">
                <Lightbulb className="h-3 w-3" />
                Ähnlich
              </span>
            )}
          </div>
          
          {entry.description && (
            <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
          )}
          
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            {entry.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {entry.address}
              </span>
            )}
            {entry.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                {entry.phone}
              </span>
            )}
            {entry.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <a href={`mailto:${entry.email}`} className="text-primary hover:underline">{entry.email}</a>
              </span>
            )}
            {entry.openingHours && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                {entry.openingHours}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [exactResults, setExactResults] = useState<DataEntry[]>([]);
  const [similarResults, setSimilarResults] = useState<DataEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Daten beim Start laden
  useEffect(() => {
    importData(sampleData);
  }, []);

  const handleSearch = useCallback(() => {
    const { exact, similar } = searchEntries(searchQuery, category);
    setExactResults(exact);
    setSimilarResults(similar);
    setHasSearched(true);
  }, [searchQuery, category]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Angebote im Sozialraum
          </h1>
          <p className="mt-2 text-muted-foreground">
            Finden Sie Angebote und Partner in Ihrer Nähe
          </p>
        </header>

        {/* Suchbereich */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Suchfeld */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Suchbegriff eingeben..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-11"
              />
            </div>
            
            {/* Kategorie (optional) */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-44 h-11">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {sampleCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Suche Button */}
            <Button onClick={handleSearch} className="h-11 px-6">
              <Search className="h-4 w-4 mr-2" />
              Suchen
            </Button>
          </div>
        </div>

        {/* Ergebnisse */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Exakte Treffer */}
          {exactResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {exactResults.length} Ergebnis{exactResults.length !== 1 ? 'se' : ''} gefunden
              </p>
              {exactResults.map((entry) => (
                <ResultCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          {/* Keine exakten Treffer, aber ähnliche */}
          {hasSearched && exactResults.length === 0 && similarResults.length > 0 && (
            <div className="space-y-3">
              <div className="text-center py-4">
                <p className="text-muted-foreground">Kein exakter Treffer gefunden</p>
                <p className="text-sm text-muted-foreground mt-1">Vielleicht passt eines dieser ähnlichen Angebote:</p>
              </div>
              {similarResults.map((entry) => (
                <ResultCard key={entry.id} entry={entry} isSimilar />
              ))}
            </div>
          )}

          {/* Keine Ergebnisse */}
          {hasSearched && exactResults.length === 0 && similarResults.length === 0 && searchQuery.trim() && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine Ergebnisse gefunden</p>
              <p className="text-sm text-muted-foreground mt-1">
                Versuchen Sie einen anderen Suchbegriff oder ändern Sie die Kategorie
              </p>
            </div>
          )}

          {/* Starthinweis */}
          {!hasSearched && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Geben Sie einen Suchbegriff ein oder wählen Sie eine Kategorie
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
