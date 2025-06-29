"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import useI18n from '@/hooks/useI18n';

interface TranslationContextType {
  t: (key: string, options?: { ns?: string; defaultValue?: string; interpolation?: Record<string, any> }) => string;
  setLanguage: (language: string) => void;
  currentLanguage: string;
  isLoading: boolean;
  loadNamespace: (namespace: string) => Promise<void>;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: React.ReactNode;
  targetLanguage: string;
  enabled?: boolean;
}

export function TranslationProvider({ 
  children, 
  targetLanguage,
  enabled = true 
}: TranslationProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { t, setLanguage, currentLanguage, isLoading, loadNamespace } = useI18n({
    targetLanguage,
    enabled 
  });

  // Load required namespaces on mount and language change
  useEffect(() => {
    const initializeTranslations = async () => {
      if (enabled && targetLanguage && targetLanguage !== 'English') {
        try {
          await Promise.all([
            loadNamespace('common'),
            loadNamespace('projects'),
            loadNamespace('editor')
          ]);
        } catch (error) {
          console.error('Failed to load translations:', error);
        }
      }
      setIsInitialized(true);
    };

    initializeTranslations();
  }, [targetLanguage, enabled, loadNamespace]);

  // Don't render children until translations are loaded
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <TranslationContext.Provider value={{ t, setLanguage, currentLanguage, isLoading, loadNamespace }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context;
}

// Convenience hook for specific namespaces
export function useTranslationsFor(namespace: string) {
  const { t, loadNamespace, isLoading } = useTranslations();
  
  useEffect(() => {
    loadNamespace(namespace);
  }, [namespace, loadNamespace]);

  const tNs = (key: string, options: { defaultValue?: string; interpolation?: Record<string, any> } = {}) => {
    return t(key, { ...options, ns: namespace });
  };

  return { t: tNs, isLoading };
}

// Individual translation components for better reusability
interface TProps {
  k: string; // translation key
  ns?: string; // namespace
  defaultValue?: string;
  interpolation?: Record<string, any>;
  children?: never;
}

export function T({ k, ns = 'common', defaultValue, interpolation }: TProps) {
  const { t } = useTranslations();
  return <>{t(k, { ns, defaultValue: defaultValue || k, interpolation })}</>;
}

// Button component with translation
interface TButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tKey: string;
  tNs?: string;
  tDefault?: string;
  tInterpolation?: Record<string, any>;
}

export function TButton({ 
  tKey, 
  tNs = 'common', 
  tDefault, 
  tInterpolation, 
  children,
  ...props 
}: TButtonProps) {
  const { t } = useTranslations();
  
  const translatedText = t(tKey, { 
    ns: tNs, 
    defaultValue: tDefault || tKey, 
    interpolation: tInterpolation 
  });

  return (
    <button {...props}>
      {children || translatedText}
    </button>
  );
}
