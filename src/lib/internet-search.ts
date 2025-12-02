import { DataEntry } from './database';

// PLATZHALTER-IMPLEMENTIERUNG für Internet-Alternativen
// HINWEIS: Hier kann später eine echte Such-API angeschlossen werden
// (z.B. Google Places API, OpenStreetMap Nominatim, oder eigenes Backend)

export interface InternetResult extends DataEntry {
  isInternetResult: true;
  source?: string;
}

// Simulierte Internet-Suche - gibt Platzhalter-Ergebnisse zurück
// TODO: Durch echte API-Calls ersetzen
export async function searchInternetAlternatives(
  query: string,
  _category?: string
): Promise<InternetResult[]> {
  // Simulierte Verzögerung für realistisches Verhalten
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Platzhalter-Ergebnisse für Demonstrationszwecke
  // In einer echten Implementierung würde hier ein API-Call stehen
  const mockResults: InternetResult[] = [
    {
      id: 'internet-1',
      name: `${query} - Online-Ergebnis 1`,
      description: 'Dies ist ein Platzhalter-Ergebnis aus dem Internet. In einer echten Implementierung würden hier reale Daten von einer externen API angezeigt.',
      category: 'Internet',
      address: 'Online-Quelle',
      isInternetResult: true,
      source: 'Beispiel-API',
    },
    {
      id: 'internet-2',
      name: `${query} - Online-Ergebnis 2`,
      description: 'Weiteres Platzhalter-Ergebnis. Ersetzen Sie die searchInternetAlternatives-Funktion durch echte API-Aufrufe.',
      category: 'Internet',
      address: 'Online-Quelle',
      isInternetResult: true,
      source: 'Beispiel-API',
    },
  ];
  
  // Nur Ergebnisse zurückgeben wenn Query nicht leer
  if (!query.trim()) {
    return [];
  }
  
  return mockResults;
}

// HINWEIS: Beispiel für eine echte API-Integration:
/*
export async function searchRealAPI(query: string): Promise<InternetResult[]> {
  const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('API-Fehler');
  }
  
  const data = await response.json();
  
  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.type,
    address: item.address,
    latitude: item.lat,
    longitude: item.lng,
    isInternetResult: true,
    source: 'Example API',
  }));
}
*/
