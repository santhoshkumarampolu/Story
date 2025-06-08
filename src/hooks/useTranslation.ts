import { useState, useEffect, useCallback, useRef } from "react"; // Added useRef

interface TranslationCache {
  [key: string]: string;
}

interface UseTranslationProps {
  targetLanguage: string | null;
  enabled?: boolean;
}

interface UseTranslationReturn {
  translate: (text: string) => string;
  isTranslating: boolean;
  translateAsync: (text: string) => Promise<string>;
  preloadTranslations: (texts: string[]) => void;
}

export function useTranslation({
  targetLanguage,
  enabled = true
}: UseTranslationProps): UseTranslationReturn {
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const cacheRef = useRef<TranslationCache>(translationCache);

  // Keep cacheRef.current in sync with translationCache
  useEffect(() => {
    cacheRef.current = translationCache;
  }, [translationCache]);

  // Clear cache when language changes
  useEffect(() => {
    setTranslationCache({});
  }, [targetLanguage]);

  const translateAsync = useCallback(async (text: string): Promise<string> => {
    if (!enabled || !targetLanguage || targetLanguage === "English") {
      return text;
    }

    const cacheKey = `${text}_${targetLanguage}`;
    // Read from cacheRef, which is updated by the useEffect above
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    try {
      setIsTranslating(true);
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        console.error("Translation API error:", response.status, response.statusText);
        const errorData = await response.text();
        console.error("Error details:", errorData);
        throw new Error(`Translation failed: ${response.status}`);
      }

      const result = await response.json();
      const translatedText = result.translatedText;

      // Cache the translation using functional update
      // The useEffect listening to translationCache will update cacheRef.current
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));

      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, [enabled, targetLanguage]); // Removed translationCache, setIsTranslating is stable

  const translate = useCallback((text: string): string => {
    // Return original text if translation is disabled or no target language
    if (!enabled || !targetLanguage || targetLanguage === "English") {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLanguage}`;
    const cachedTranslation = translationCache[cacheKey];
    
    if (cachedTranslation) {
      // Return bilingual format: "English (Translation)"
      return `${text} (${cachedTranslation})`;
    }

    // If not in cache, return original text only (don't trigger async translation during render)
    return text;
  }, [enabled, targetLanguage, translationCache]);

  const preloadTranslations = useCallback((texts: string[]) => {
    if (!enabled || !targetLanguage || targetLanguage === "English") {
      return;
    }

    texts.forEach(text => {
      const cacheKey = `${text}_${targetLanguage}`;
      // Check cache using cacheRef
      if (!cacheRef.current[cacheKey]) {
        setTimeout(async () => {
          try {
            await translateAsync(text); // translateAsync is now more stable
          } catch (error) {
            // Silently fail for preload translations
            console.debug(`Failed to preload translation for "${text}":`, error);
          }
        }, 0);
      }
    });
  }, [enabled, targetLanguage, translateAsync]); // Removed translationCache

  return {
    translate,
    isTranslating,
    translateAsync,
    preloadTranslations
  };
}

// Utility function to format text with translation
export function formatWithTranslation(originalText: string, translatedText?: string): string {
  if (!translatedText || translatedText === originalText) {
    return originalText;
  }
  return `${originalText} (${translatedText})`;
}

// Common translations for UI labels
export const commonLabels = {
  "Characters": "Characters",
  "Scenes": "Scenes", 
  "Script": "Script",
  "Idea": "Idea",
  "Treatment": "Treatment",
  "Logline": "Logline",
  "Generate": "Generate",
  "Save": "Save",
  "Delete": "Delete",
  "Edit": "Edit",
  "Add": "Add",
  "Title": "Title",
  "Description": "Description",
  "Summary": "Summary",
  "Storyboard": "Storyboard",
  "Preview": "Preview",
  "Export": "Export",
  "Share": "Share"
};
