import { useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

export function SearchBar() {
  const { 
    language, 
    searchQuery, 
    setSearchQuery, 
    isSearching, 
    performSearch,
    dataLoaded 
  } = useApp();
  
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  // Debounced Suche bei Eingabe
  useEffect(() => {
    if (!dataLoaded) return;
    
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch, dataLoaded]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  }, [performSearch]);
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
            disabled={!dataLoaded}
          />
        </div>
        <Button 
          type="submit" 
          size="lg"
          disabled={!dataLoaded || isSearching}
          className="h-12 px-6"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">{t('searchButton')}</span>
        </Button>
      </div>
    </form>
  );
}
