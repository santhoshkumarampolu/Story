"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';

interface TranslationContextValue {
  t: (key: string, options?: { ns?: string; defaultValue?: string; interpolation?: Record<string, any> }) => string;
  isLoading: boolean;
  loadNamespace: (namespace: string) => Promise<void>;
  setLanguage: (language: string) => void;
  currentLanguage: string;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

interface TranslationProviderProps {
  children: React.ReactNode;
  language: string;
  enabled?: boolean;
}

export function TranslationProvider({ 
  children, 
  language, 
  enabled = true 
}: TranslationProviderProps) {
  const i18n = useI18n({ 
    targetLanguage: language, 
    enabled 
  });

  // Preload common namespaces
  useEffect(() => {
    if (enabled && language && language !== 'English') {
      i18n.loadNamespace('common');
      i18n.loadNamespace('projects');
      i18n.loadNamespace('editor');
    }
  }, [i18n, language, enabled]);

  return (
    <TranslationContext.Provider value={i18n}>
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
