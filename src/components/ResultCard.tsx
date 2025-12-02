import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { formatDistance } from '@/lib/geolocation';
import { DataEntry } from '@/lib/database';
import { InternetResult } from '@/lib/internet-search';
import { MapPin, Globe, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  entry: DataEntry | InternetResult;
  isInternet?: boolean;
}

export function ResultCard({ entry, isInternet = false }: ResultCardProps) {
  const { language, getDistanceToEntry } = useApp();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const distance = getDistanceToEntry(entry);
  const formattedDistance = distance !== null ? formatDistance(distance, language) : null;
  
  return (
    <div 
      className={cn(
        "result-card animate-fade-in",
        isInternet && "result-card-internet"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="font-display font-semibold text-foreground truncate">
            {entry.name}
          </h3>
          
          {/* Beschreibung */}
          {entry.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {entry.description}
            </p>
          )}
          
          {/* Meta-Informationen */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Kategorie-Badge */}
            {entry.category && (
              <span className={cn(
                "category-badge",
                isInternet && "bg-internet/10 text-internet"
              )}>
                {entry.category}
              </span>
            )}
            
            {/* Internet-Badge */}
            {isInternet && (
              <span className="internet-badge">
                <Globe className="h-3 w-3" />
                Internet
              </span>
            )}
            
            {/* Adresse */}
            {entry.address && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {entry.address}
              </span>
            )}
          </div>
        </div>
        
        {/* Distanz-Anzeige */}
        {formattedDistance && (
          <div className="flex-shrink-0">
            <span className="distance-badge">
              <Navigation className="h-3 w-3" />
              {formattedDistance}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
