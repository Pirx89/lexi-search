// In-Memory Datenbank für die Suchdaten
// Die Daten werden aus der Excel-Datei importiert und hier gespeichert

export interface DataEntry {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  // Erweiterbare Felder - zusätzliche Daten aus Excel
  [key: string]: unknown;
}

// In-Memory Datenspeicher
let database: DataEntry[] = [];
let categories: string[] = [];

// Datenbank initialisieren/zurücksetzen
export function resetDatabase(): void {
  database = [];
  categories = [];
}

// Daten in die Datenbank importieren
export function importData(entries: DataEntry[]): void {
  resetDatabase();
  database = entries;
  
  // Kategorien extrahieren
  const categorySet = new Set<string>();
  entries.forEach(entry => {
    if (entry.category) {
      categorySet.add(entry.category);
    }
  });
  categories = Array.from(categorySet).sort();
}

// Alle Daten abrufen
export function getAllEntries(): DataEntry[] {
  return [...database];
}

// Kategorien abrufen
export function getCategories(): string[] {
  return [...categories];
}

// Datenbank-Größe
export function getDatabaseSize(): number {
  return database.length;
}

// Suche in der Datenbank
export function searchEntries(
  query: string,
  categoryFilter?: string,
  additionalFilter?: string
): DataEntry[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return database.filter(entry => {
    // Textsuche in Name und Beschreibung
    const matchesQuery = !normalizedQuery || 
      entry.name?.toLowerCase().includes(normalizedQuery) ||
      entry.description?.toLowerCase().includes(normalizedQuery) ||
      entry.address?.toLowerCase().includes(normalizedQuery);
    
    // Kategoriefilter
    const matchesCategory = !categoryFilter || 
      categoryFilter === 'all' ||
      entry.category === categoryFilter;
    
    // Zusätzlicher Textfilter
    const normalizedAdditional = additionalFilter?.toLowerCase().trim();
    const matchesAdditional = !normalizedAdditional ||
      entry.name?.toLowerCase().includes(normalizedAdditional) ||
      entry.description?.toLowerCase().includes(normalizedAdditional) ||
      entry.category?.toLowerCase().includes(normalizedAdditional) ||
      entry.address?.toLowerCase().includes(normalizedAdditional);
    
    return matchesQuery && matchesCategory && matchesAdditional;
  });
}
