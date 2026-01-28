import { useState, useEffect, useCallback, useRef } from "react";

interface TranslationCache {
  [key: string]: any;
}

interface UseI18nProps {
  targetLanguage: string | null;
  enabled?: boolean;
}

interface UseI18nReturn {
  t: (key: string, options?: { ns?: string; defaultValue?: string; interpolation?: Record<string, any> }) => string;
  isLoading: boolean;
  loadNamespace: (namespace: string) => Promise<void>;
  setLanguage: (language: string) => void;
  currentLanguage: string;
}

// Cache for loaded translation files
const translationCache: Record<string, Record<string, any>> = {};

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to interpolate variables in translation strings
function interpolate(template: string, values: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

export function useI18n({
  targetLanguage,
  enabled = true
}: UseI18nProps): UseI18nReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(targetLanguage || 'en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const loadedNamespaces = useRef<Set<string>>(new Set());
  const pendingLoads = useRef<Set<string>>(new Set());

  // Update current language when prop changes and clear loaded namespaces
  useEffect(() => {
    if (targetLanguage && targetLanguage !== currentLanguage) {
      loadedNamespaces.current.clear();
      setCurrentLanguage(targetLanguage);
    }
  }, [targetLanguage, currentLanguage]);

  const loadNamespace = useCallback(async (namespace: string) => {
    if (!enabled || !currentLanguage) return;

    const cacheKey = `${currentLanguage}:${namespace}`;

    // Return if already loaded or currently loading
    if (translationCache[cacheKey] || loadedNamespaces.current.has(cacheKey) || pendingLoads.current.has(cacheKey)) {
      return;
    }

    pendingLoads.current.add(cacheKey);
    setIsLoading(true);

    try {
      // Map language codes (support both names and codes)
      // If currentLanguage is a 2-character code, use it directly
      let langCode = currentLanguage.length === 2 ? currentLanguage.toLowerCase() : 'en';
      
      if (currentLanguage.length > 2) {
        langCode =
          currentLanguage === 'English' ? 'en' :
          currentLanguage === 'Telugu'  ? 'te' :
          currentLanguage === 'Hindi'   ? 'hi' :
          currentLanguage === 'Tamil'   ? 'ta' :
          currentLanguage === 'Kannada' ? 'kn' :
          currentLanguage === 'Malayalam' ? 'ml' :
          currentLanguage === 'Spanish' ? 'es' :
          currentLanguage === 'French' ? 'fr' :
          currentLanguage === 'German' ? 'de' : 'en';
      }

      // Try to load the translation file
      const response = await fetch(`/locales/${langCode}/${namespace}.json`);
      
      if (response.ok) {
        const translations = await response.json();
        translationCache[cacheKey] = translations;
        loadedNamespaces.current.add(cacheKey);
        // Update state to trigger re-render
        setTranslations(prev => ({ ...prev, [cacheKey]: translations }));
      } else {
        // Fallback to English if target language file doesn't exist
        if (langCode !== 'en') {
          const fallbackResponse = await fetch(`/locales/en/${namespace}.json`);
          if (fallbackResponse.ok) {
            const fallbackTranslations = await fallbackResponse.json();
            translationCache[cacheKey] = fallbackTranslations;
            loadedNamespaces.current.add(cacheKey);
            // Update state to trigger re-render
            setTranslations(prev => ({ ...prev, [cacheKey]: fallbackTranslations }));
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${namespace}:`, error);
    } finally {
      pendingLoads.current.delete(cacheKey);
      setIsLoading(false);
    }
  }, [currentLanguage, enabled]);

  const t = useCallback((
    key: string, 
    options: { 
      ns?: string; 
      defaultValue?: string; 
      interpolation?: Record<string, any> 
    } = {}
  ): string => {
    const { ns = 'common', defaultValue = key, interpolation = {} } = options;
    
    // If translations are disabled, return default value
    if (!enabled) {
      return defaultValue;
    }

    // For English, try to get from English translation file first, then fallback to default
    if (currentLanguage === 'English' || currentLanguage === 'en') {
      const englishCacheKey = `en:${ns}`;
      const englishTranslations = translations[englishCacheKey] || translationCache[englishCacheKey];
      if (englishTranslations) {
        const englishValue = getNestedValue(englishTranslations, key);
        if (englishValue) {
          const result = typeof englishValue === 'string' && Object.keys(interpolation).length > 0
            ? interpolate(englishValue, interpolation)
            : englishValue;
          return result;
        }
      }
      return defaultValue;
    }

    const cacheKey = `${currentLanguage}:${ns}`;
    const cachedTranslations = translations[cacheKey] || translationCache[cacheKey];
    
    if (!cachedTranslations) {
      // Don't call loadNamespace during render - components should load namespaces in useEffect
      return defaultValue;
    }

    const translatedValue = getNestedValue(cachedTranslations, key);
    
    if (translatedValue) {
      // Apply interpolation if provided
      const result = typeof translatedValue === 'string' && Object.keys(interpolation).length > 0
        ? interpolate(translatedValue, interpolation)
        : translatedValue;
      
      return result;
    }

    return defaultValue;
  }, [enabled, currentLanguage, loadNamespace, translations]);

  const setLanguage = useCallback((language: string) => {
    setCurrentLanguage(language);
    // Clear loaded namespaces to force reload
    loadedNamespaces.current.clear();
    translationCache[language] = {};
  }, []);

  return {
    t,
    isLoading,
    loadNamespace,
    setLanguage,
    currentLanguage
  };
}

export default useI18n;
