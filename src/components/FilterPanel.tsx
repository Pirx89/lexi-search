import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';

export function FilterPanel() {
  const { 
    language, 
    categories, 
    categoryFilter, 
    setCategoryFilter,
    additionalFilter,
    setAdditionalFilter,
    dataLoaded 
  } = useApp();
  
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-foreground">{t('filterTitle')}</h3>
      </div>
      
      <div className="space-y-4">
        {/* Kategorie-Filter */}
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-sm text-muted-foreground">
            {t('categoryFilter')}
          </Label>
          <Select 
            value={categoryFilter} 
            onValueChange={setCategoryFilter}
            disabled={!dataLoaded}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder={t('allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Zusätzlicher Textfilter */}
        <div className="space-y-2">
          <Label htmlFor="additional-filter" className="text-sm text-muted-foreground">
            {t('additionalFilter')}
          </Label>
          <Input
            id="additional-filter"
            type="text"
            value={additionalFilter}
            onChange={(e) => setAdditionalFilter(e.target.value)}
            placeholder="..."
            disabled={!dataLoaded}
          />
        </div>
      </div>
    </div>
  );
}
