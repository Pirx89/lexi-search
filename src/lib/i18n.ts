// Übersetzungssystem - Einfaches JSON-Objekt für alle UI-Texte
// HINWEIS: Hier können später echte Übersetzungs-APIs angeschlossen werden

export type Language = 'de' | 'en' | 'it';

export const translations = {
  de: {
    // Header
    appTitle: 'Suchportal',
    appSubtitle: 'Finden Sie was Sie suchen',
    
    // Suche
    searchPlaceholder: 'Begriff eingeben...',
    searchButton: 'Suchen',
    
    // Filter
    filterTitle: 'Filter',
    categoryFilter: 'Kategorie',
    allCategories: 'Alle Kategorien',
    additionalFilter: 'Zusätzlicher Filter',
    
    // Sprache
    language: 'Sprache',
    german: 'Deutsch',
    english: 'Englisch',
    italian: 'Italienisch',
    
    // Ergebnisse
    results: 'Ergebnisse',
    noResults: 'Keine Ergebnisse gefunden',
    noResultsHint: 'Versuchen Sie einen anderen Suchbegriff oder ändern Sie die Filter.',
    localResults: 'Lokale Ergebnisse',
    internetAlternatives: 'Internet-Alternativen',
    internetDisclaimer: 'Hinweis: Diese Alternativen wurden aus dem Internet bezogen. Für ihre Aktualität und Richtigkeit kann nicht garantiert werden.',
    distance: 'Entfernung',
    km: 'km',
    
    // Upload
    uploadTitle: 'Excel-Datei importieren',
    uploadHint: 'Ziehen Sie eine .xlsx-Datei hierher oder klicken Sie zum Auswählen',
    uploadButton: 'Datei auswählen',
    uploadSuccess: 'Datei erfolgreich importiert',
    uploadError: 'Fehler beim Import der Datei',
    dataLoaded: 'Einträge geladen',
    
    // Standort
    locationRequest: 'Standort ermitteln',
    locationEnabled: 'Standort aktiv',
    locationDenied: 'Standort nicht verfügbar',
    locationError: 'Standortabfrage fehlgeschlagen',
    
    // Allgemein
    loading: 'Laden...',
    error: 'Ein Fehler ist aufgetreten',
    retry: 'Erneut versuchen',
    close: 'Schließen',
  },
  en: {
    appTitle: 'Search Portal',
    appSubtitle: 'Find what you are looking for',
    
    searchPlaceholder: 'Enter search term...',
    searchButton: 'Search',
    
    filterTitle: 'Filters',
    categoryFilter: 'Category',
    allCategories: 'All Categories',
    additionalFilter: 'Additional Filter',
    
    language: 'Language',
    german: 'German',
    english: 'English',
    italian: 'Italian',
    
    results: 'Results',
    noResults: 'No results found',
    noResultsHint: 'Try a different search term or adjust the filters.',
    localResults: 'Local Results',
    internetAlternatives: 'Internet Alternatives',
    internetDisclaimer: 'Note: These alternatives were retrieved from the internet. Their accuracy and currentness cannot be guaranteed.',
    distance: 'Distance',
    km: 'km',
    
    uploadTitle: 'Import Excel File',
    uploadHint: 'Drag a .xlsx file here or click to select',
    uploadButton: 'Select File',
    uploadSuccess: 'File successfully imported',
    uploadError: 'Error importing file',
    dataLoaded: 'entries loaded',
    
    locationRequest: 'Get Location',
    locationEnabled: 'Location Active',
    locationDenied: 'Location unavailable',
    locationError: 'Location request failed',
    
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    close: 'Close',
  },
  it: {
    appTitle: 'Portale di Ricerca',
    appSubtitle: 'Trova quello che cerchi',
    
    searchPlaceholder: 'Inserisci termine di ricerca...',
    searchButton: 'Cerca',
    
    filterTitle: 'Filtri',
    categoryFilter: 'Categoria',
    allCategories: 'Tutte le Categorie',
    additionalFilter: 'Filtro Aggiuntivo',
    
    language: 'Lingua',
    german: 'Tedesco',
    english: 'Inglese',
    italian: 'Italiano',
    
    results: 'Risultati',
    noResults: 'Nessun risultato trovato',
    noResultsHint: 'Prova un termine di ricerca diverso o modifica i filtri.',
    localResults: 'Risultati Locali',
    internetAlternatives: 'Alternative da Internet',
    internetDisclaimer: 'Nota: Queste alternative sono state recuperate da Internet. La loro accuratezza e attualità non può essere garantita.',
    distance: 'Distanza',
    km: 'km',
    
    uploadTitle: 'Importa File Excel',
    uploadHint: 'Trascina un file .xlsx qui o clicca per selezionare',
    uploadButton: 'Seleziona File',
    uploadSuccess: 'File importato con successo',
    uploadError: 'Errore durante l\'importazione del file',
    dataLoaded: 'voci caricate',
    
    locationRequest: 'Ottieni Posizione',
    locationEnabled: 'Posizione Attiva',
    locationDenied: 'Posizione non disponibile',
    locationError: 'Richiesta posizione fallita',
    
    loading: 'Caricamento...',
    error: 'Si è verificato un errore',
    retry: 'Riprova',
    close: 'Chiudi',
  },
} as const;

export type TranslationKey = keyof typeof translations.de;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.de[key] || key;
}

// HINWEIS: Hier kann später eine echte Übersetzungs-API (z.B. DeepL, Google Translate)
// für die dynamische Übersetzung von Ergebnistexten angeschlossen werden.
export async function translateText(text: string, targetLang: Language): Promise<string> {
  // Platzhalter-Implementierung - gibt den Originaltext zurück
  // TODO: Echte API hier implementieren
  return text;
}
