import { useCallback, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function FileUpload() {
  const { language, importExcelFile, isUploading, dataLoaded, entryCount } = useApp();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Bitte eine Excel-Datei (.xlsx) auswählen');
      return;
    }
    
    try {
      await importExcelFile(file);
      toast.success(t('uploadSuccess'));
    } catch (error) {
      toast.error(t('uploadError'));
    }
  }, [importExcelFile, t]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);
  
  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={cn(
          "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          isUploading && "pointer-events-none opacity-50",
          dataLoaded ? "border-success/50 bg-success/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-3">
          {dataLoaded ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {entryCount} {t('dataLoaded')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('uploadHint')}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}>
                {isUploading ? (
                  <div className="animate-spin">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                ) : (
                  <Upload className={cn(
                    "h-6 w-6 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )} />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {t('uploadTitle')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('uploadHint')}
                </p>
              </div>
            </>
          )}
        </div>
        
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
