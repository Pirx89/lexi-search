import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language } from '@/lib/i18n';
import { DataEntry, importData, getDatabaseSize, getCategories, searchEntries } from '@/lib/database';
import { UserLocation, requestUserLocation, calculateDistance } from '@/lib/geolocation';
import { parseExcelFile } from '@/lib/excel-parser';
import { searchInternetAlternatives, InternetResult } from '@/lib/internet-search';

interface AppState {
  // Sprache
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Datenbank
  dataLoaded: boolean;
  entryCount: number;
  categories: string[];
  importExcelFile: (file: File) => Promise<void>;
  
  // Suche
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  additionalFilter: string;
  setAdditionalFilter: (filter: string) => void;
  
  // Ergebnisse
  localResults: DataEntry[];
  internetResults: InternetResult[];
  isSearching: boolean;
  performSearch: () => Promise<void>;
  
  // Standort
  userLocation: UserLocation | null;
  locationStatus: 'idle' | 'requesting' | 'granted' | 'denied';
  requestLocation: () => Promise<void>;
  getDistanceToEntry: (entry: DataEntry) => number | null;
  
  // UI
  isUploading: boolean;
  uploadError: string | null;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Sprache (Standard: Deutsch)
  const [language, setLanguage] = useState<Language>('de');
  
  // Datenbank-Status
  const [dataLoaded, setDataLoaded] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  
  // Suchzustand
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [additionalFilter, setAdditionalFilter] = useState('');
  
  // Ergebnisse
  const [localResults, setLocalResults] = useState<DataEntry[]>([]);
  const [internetResults, setInternetResults] = useState<InternetResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Standort
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  
  // Upload-Status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Excel-Import
  const importExcelFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const entries = await parseExcelFile(file);
      importData(entries);
      setEntryCount(getDatabaseSize());
      setCategoryList(getCategories());
      setDataLoaded(true);
      
      // Ergebnisse zurücksetzen
      setLocalResults([]);
      setInternetResults([]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unbekannter Fehler');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);
  
  // Suche durchführen
  const performSearch = useCallback(async () => {
    setIsSearching(true);
    
    try {
      // Lokale Suche
      const local = searchEntries(searchQuery, categoryFilter, additionalFilter);
      setLocalResults(local);
      
      // Wenn keine lokalen Ergebnisse, Internet-Alternativen suchen
      if (local.length === 0 && searchQuery.trim()) {
        const internet = await searchInternetAlternatives(searchQuery, categoryFilter);
        setInternetResults(internet);
      } else {
        setInternetResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, categoryFilter, additionalFilter]);
  
  // Standort anfragen
  const requestLocation = useCallback(async () => {
    setLocationStatus('requesting');
    
    try {
      const location = await requestUserLocation();
      setUserLocation(location);
      setLocationStatus('granted');
    } catch {
      setLocationStatus('denied');
    }
  }, []);
  
  // Distanz zu einem Eintrag berechnen
  const getDistanceToEntry = useCallback((entry: DataEntry): number | null => {
    if (!userLocation || entry.latitude === undefined || entry.longitude === undefined) {
      return null;
    }
    
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      entry.latitude,
      entry.longitude
    );
  }, [userLocation]);
  
  const value: AppState = {
    language,
    setLanguage,
    dataLoaded,
    entryCount,
    categories: categoryList,
    importExcelFile,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    additionalFilter,
    setAdditionalFilter,
    localResults,
    internetResults,
    isSearching,
    performSearch,
    userLocation,
    locationStatus,
    requestLocation,
    getDistanceToEntry,
    isUploading,
    uploadError,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
