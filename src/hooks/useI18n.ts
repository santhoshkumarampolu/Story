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
  const loadedNamespaces = useRef<Set<string>>(new Set());
  const pendingLoads = useRef<Set<string>>(new Set());

  // Update current language when prop changes
  useEffect(() => {
    if (targetLanguage) {
      setCurrentLanguage(targetLanguage);
    }
  }, [targetLanguage]);

  const loadNamespace = useCallback(async (namespace: string) => {
    const cacheKey = `${currentLanguage}:${namespace}`;
    
    // Return if already loaded or currently loading
    if (translationCache[cacheKey] || loadedNamespaces.current.has(cacheKey) || pendingLoads.current.has(cacheKey)) {
      return;
    }

    pendingLoads.current.add(cacheKey);
    setIsLoading(true);

    try {
      // Map language codes (support both names and codes)
      const langCode =
        currentLanguage === 'English' || currentLanguage === 'en' ? 'en' :
        currentLanguage === 'Telugu'  || currentLanguage === 'te' ? 'te' :
        currentLanguage === 'Hindi'   || currentLanguage === 'hi' ? 'hi' : 'en';

      // Try to load the translation file
      const response = await fetch(`/locales/${langCode}/${namespace}.json`);
      
      if (response.ok) {
        const translations = await response.json();
        translationCache[cacheKey] = translations;
        loadedNamespaces.current.add(cacheKey);
      } else {
        // Fallback to English if target language file doesn't exist
        if (langCode !== 'en') {
          const fallbackResponse = await fetch(`/locales/en/${namespace}.json`);
          if (fallbackResponse.ok) {
            const fallbackTranslations = await fallbackResponse.json();
            translationCache[cacheKey] = fallbackTranslations;
            loadedNamespaces.current.add(cacheKey);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${namespace}:`, error);
    } finally {
      pendingLoads.current.delete(cacheKey);
      setIsLoading(false);
    }
  }, [currentLanguage]);

  const t = useCallback((
    key: string, 
    options: { 
      ns?: string; 
      defaultValue?: string; 
      interpolation?: Record<string, any> 
    } = {}
  ): string => {
    const { ns = 'common', defaultValue = key, interpolation = {} } = options;
    
    // If translations are disabled or language is English, return default value
    if (!enabled || currentLanguage === 'English' || currentLanguage === 'en') {
      return defaultValue;
    }

    const cacheKey = `${currentLanguage}:${ns}`;
    const translations = translationCache[cacheKey];
    
    if (!translations) {
      // Queue namespace loading but don't wait for it
      if (!pendingLoads.current.has(cacheKey)) {
        loadNamespace(ns).catch(console.error);
      }
      return defaultValue;
    }

    const translatedValue = getNestedValue(translations, key);
    
    if (translatedValue) {
      // Apply interpolation if provided
      const result = typeof translatedValue === 'string' && Object.keys(interpolation).length > 0
        ? interpolate(translatedValue, interpolation)
        : translatedValue;
      
      // Return bilingual format for non-English languages
      return `${defaultValue} (${result})`;
    }

    return defaultValue;
  }, [enabled, currentLanguage, loadNamespace]);

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
