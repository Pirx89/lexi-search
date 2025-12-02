// In-Memory Datenbank für die Suchdaten

export interface DataEntry {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

let database: DataEntry[] = [];
let categories: string[] = [];

export function resetDatabase(): void {
  database = [];
  categories = [];
}

export function importData(entries: DataEntry[]): void {
  resetDatabase();
  database = entries;
  
  const categorySet = new Set<string>();
  entries.forEach(entry => {
    if (entry.category) {
      categorySet.add(entry.category);
    }
  });
  categories = Array.from(categorySet).sort();
}

export function getAllEntries(): DataEntry[] {
  return [...database];
}

export function getCategories(): string[] {
  return [...categories];
}

export function getDatabaseSize(): number {
  return database.length;
}

// Ähnlichkeits-Score berechnen (Levenshtein-ähnlich, vereinfacht)
function similarityScore(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Wortweise Übereinstimmung
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matches = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1.includes(w2) || w2.includes(w1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

// Suche mit Ähnlichkeits-Ranking
export function searchEntries(
  query: string,
  categoryFilter?: string
): { exact: DataEntry[]; similar: DataEntry[] } {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    // Keine Suche - alle Einträge nach Kategorie filtern
    const filtered = categoryFilter && categoryFilter !== 'all'
      ? database.filter(e => e.category === categoryFilter)
      : database;
    return { exact: filtered, similar: [] };
  }
  
  const exact: DataEntry[] = [];
  const similarWithScore: { entry: DataEntry; score: number }[] = [];
  
  database.forEach(entry => {
    // Kategoriefilter anwenden
    if (categoryFilter && categoryFilter !== 'all' && entry.category !== categoryFilter) {
      return;
    }
    
    const nameMatch = entry.name?.toLowerCase().includes(normalizedQuery);
    const descMatch = entry.description?.toLowerCase().includes(normalizedQuery);
    const addressMatch = entry.address?.toLowerCase().includes(normalizedQuery);
    const categoryMatch = entry.category?.toLowerCase().includes(normalizedQuery);
    
    if (nameMatch || descMatch || addressMatch || categoryMatch) {
      exact.push(entry);
    } else {
      // Ähnlichkeit berechnen
      const score = Math.max(
        similarityScore(entry.name || '', normalizedQuery),
        similarityScore(entry.category || '', normalizedQuery) * 0.7,
        similarityScore(entry.address || '', normalizedQuery) * 0.5
      );
      
      if (score > 0.2) {
        similarWithScore.push({ entry, score });
      }
    }
  });
  
  // Ähnliche nach Score sortieren
  similarWithScore.sort((a, b) => b.score - a.score);
  const similar = similarWithScore.slice(0, 5).map(s => s.entry);
  
  return { exact, similar };
}
