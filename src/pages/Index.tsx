import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { ResultsList } from '@/components/ResultsList';
import { AppProvider } from '@/contexts/AppContext';

function SearchApp() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Seitenleiste: Upload & Filter */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <FileUpload />
            <FilterPanel />
          </aside>
          
          {/* Hauptbereich: Suche & Ergebnisse */}
          <div className="space-y-6">
            <SearchBar />
            <ResultsList />
          </div>
        </div>
      </main>
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <SearchApp />
    </AppProvider>
  );
};

export default Index;
