import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { ResultCard } from './ResultCard';
import { SearchX, Globe, AlertTriangle } from 'lucide-react';

export function ResultsList() {
  const { 
    language, 
    localResults, 
    internetResults, 
    searchQuery, 
    dataLoaded,
    isSearching 
  } = useApp();
  
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const hasLocalResults = localResults.length > 0;
  const hasInternetResults = internetResults.length > 0;
  const hasSearched = searchQuery.trim().length > 0;
  const noResults = hasSearched && !hasLocalResults && !hasInternetResults && !isSearching;
  
  if (!dataLoaded) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Ergebnis-Header */}
      {hasSearched && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t('results')}
          </h2>
          {hasLocalResults && (
            <span className="text-sm text-muted-foreground">
              {localResults.length} {t('localResults').toLowerCase()}
            </span>
          )}
        </div>
      )}
      
      {/* Keine Ergebnisse */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-medium text-foreground">{t('noResults')}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {t('noResultsHint')}
          </p>
        </div>
      )}
      
      {/* Lokale Ergebnisse */}
      {hasLocalResults && (
        <div className="space-y-3">
          {localResults.map((entry) => (
            <ResultCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
      
      {/* Internet-Alternativen */}
      {hasInternetResults && (
        <div className="space-y-4">
          {/* Trennlinie und Titel */}
          <div className="flex items-center gap-3 pt-4">
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2 text-internet">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{t('internetAlternatives')}</span>
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          {/* Warnhinweis */}
          <div className="flex items-start gap-3 rounded-lg bg-internet-bg p-3 border border-internet/20">
            <AlertTriangle className="h-5 w-5 text-internet flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              {t('internetDisclaimer')}
            </p>
          </div>
          
          {/* Internet-Ergebnisse */}
          <div className="space-y-3">
            {internetResults.map((entry) => (
              <ResultCard key={entry.id} entry={entry} isInternet />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
