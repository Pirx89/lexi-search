import * as XLSX from 'xlsx';
import { DataEntry } from './database';

// Excel-Datei parsen und in DataEntry-Array umwandeln
// Annahme: Erste Zeile enthält Spaltenüberschriften

// Mapping von möglichen Spaltennamen zu unseren Standardfeldern
const columnMappings: Record<string, keyof DataEntry> = {
  // ID-Varianten
  'id': 'id',
  'ID': 'id',
  'nummer': 'id',
  'Nummer': 'id',
  'nr': 'id',
  'Nr': 'id',
  
  // Name-Varianten
  'name': 'name',
  'Name': 'name',
  'bezeichnung': 'name',
  'Bezeichnung': 'name',
  'titel': 'name',
  'Titel': 'name',
  'begriff': 'name',
  'Begriff': 'name',
  
  // Beschreibung-Varianten
  'description': 'description',
  'Description': 'description',
  'beschreibung': 'description',
  'Beschreibung': 'description',
  'info': 'description',
  'Info': 'description',
  'details': 'description',
  'Details': 'description',
  
  // Kategorie-Varianten
  'category': 'category',
  'Category': 'category',
  'kategorie': 'category',
  'Kategorie': 'category',
  'typ': 'category',
  'Typ': 'category',
  'art': 'category',
  'Art': 'category',
  
  // Adresse-Varianten
  'address': 'address',
  'Address': 'address',
  'adresse': 'address',
  'Adresse': 'address',
  'ort': 'address',
  'Ort': 'address',
  'standort': 'address',
  'Standort': 'address',
  'location': 'address',
  'Location': 'address',
  
  // Koordinaten-Varianten
  'latitude': 'latitude',
  'Latitude': 'latitude',
  'lat': 'latitude',
  'Lat': 'latitude',
  'breitengrad': 'latitude',
  'Breitengrad': 'latitude',
  
  'longitude': 'longitude',
  'Longitude': 'longitude',
  'lon': 'longitude',
  'Lon': 'longitude',
  'lng': 'longitude',
  'Lng': 'longitude',
  'längengrad': 'longitude',
  'Längengrad': 'longitude',
};

export async function parseExcelFile(file: File): Promise<DataEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Erstes Worksheet nehmen
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // In JSON umwandeln (erste Zeile = Header)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        
        if (jsonData.length < 2) {
          reject(new Error('Die Excel-Datei enthält keine Daten.'));
          return;
        }
        
        // Header extrahieren
        const headers = jsonData[0] as string[];
        
        // Mapping der Spaltenindizes zu unseren Feldern
        const fieldIndexMap: Record<string, number> = {};
        headers.forEach((header, index) => {
          const mappedField = columnMappings[header];
          if (mappedField) {
            fieldIndexMap[mappedField] = index;
          }
        });
        
        // Datenzeilen verarbeiten
        const entries: DataEntry[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as unknown[];
          
          // Leere Zeilen überspringen
          if (!row || row.length === 0 || !row.some(cell => cell !== undefined && cell !== '')) {
            continue;
          }
          
          const entry: DataEntry = {
            id: row[fieldIndexMap['id']] as string | number || i,
            name: String(row[fieldIndexMap['name']] || `Eintrag ${i}`),
          };
          
          // Optionale Felder hinzufügen
          if (fieldIndexMap['description'] !== undefined) {
            entry.description = String(row[fieldIndexMap['description']] || '');
          }
          if (fieldIndexMap['category'] !== undefined) {
            entry.category = String(row[fieldIndexMap['category']] || '');
          }
          if (fieldIndexMap['address'] !== undefined) {
            entry.address = String(row[fieldIndexMap['address']] || '');
          }
          if (fieldIndexMap['latitude'] !== undefined) {
            const lat = row[fieldIndexMap['latitude']];
            if (lat !== undefined && lat !== '') {
              entry.latitude = Number(lat);
            }
          }
          if (fieldIndexMap['longitude'] !== undefined) {
            const lng = row[fieldIndexMap['longitude']];
            if (lng !== undefined && lng !== '') {
              entry.longitude = Number(lng);
            }
          }
          
          // Alle anderen Spalten als zusätzliche Felder speichern
          headers.forEach((header, index) => {
            if (!columnMappings[header] && row[index] !== undefined) {
              entry[header] = row[index];
            }
          });
          
          entries.push(entry);
        }
        
        resolve(entries);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsBinaryString(file);
  });
}
