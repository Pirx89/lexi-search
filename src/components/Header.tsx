import { useApp } from '@/contexts/AppContext';
import { getTranslation, Language } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, MapPinOff, Loader2, Search } from 'lucide-react';

export function Header() {
  const { language, setLanguage, locationStatus, requestLocation } = useApp();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const getLocationIcon = () => {
    switch (locationStatus) {
      case 'requesting':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'granted':
        return <MapPin className="h-4 w-4" />;
      case 'denied':
        return <MapPinOff className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };
  
  const getLocationText = () => {
    switch (locationStatus) {
      case 'requesting':
        return t('loading');
      case 'granted':
        return t('locationEnabled');
      case 'denied':
        return t('locationDenied');
      default:
        return t('locationRequest');
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Titel */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">
              {t('appTitle')}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>
        
        {/* Rechte Seite: Standort & Sprache */}
        <div className="flex items-center gap-3">
          {/* Standort-Button */}
          <Button
            variant={locationStatus === 'granted' ? 'secondary' : 'outline'}
            size="sm"
            onClick={requestLocation}
            disabled={locationStatus === 'requesting'}
            className="hidden sm:flex"
          >
            {getLocationIcon()}
            <span className="ml-2">{getLocationText()}</span>
          </Button>
          
          {/* Mobile: Nur Icon */}
          <Button
            variant={locationStatus === 'granted' ? 'secondary' : 'outline'}
            size="icon"
            onClick={requestLocation}
            disabled={locationStatus === 'requesting'}
            className="sm:hidden"
          >
            {getLocationIcon()}
          </Button>
          
          {/* Sprachauswahl */}
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">🇩🇪 {t('german')}</SelectItem>
              <SelectItem value="en">🇬🇧 {t('english')}</SelectItem>
              <SelectItem value="it">🇮🇹 {t('italian')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
