"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LanguageSwitcherProps {
  currentLanguage: string | null | undefined;
  onLanguageChange: (language: string) => void;
}

const supportedLanguages = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളं' },
];

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  // Map legacy names or mixed codes to canonical keys for robust support
  const normalizeLang = (l: string | null | undefined) => {
    if (!l) return 'en';
    const lower = l.toLowerCase();
    
    // Check if it's already a code we support
    if (supportedLanguages.some(lang => lang.code === lower)) return lower;

    if (lower === 'english') return 'en';
    if (lower === 'hindi') return 'hi';
    if (lower === 'telugu') return 'te';
    if (lower === 'spanish') return 'es';
    if (lower === 'french') return 'fr';
    if (lower === 'german') return 'de';
    
    return lower;
  };

  const selectedLanguage = normalizeLang(currentLanguage);
  
  return (
    <div className="flex items-center space-x-3">
      <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/40">Language</span>
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-32 h-8 bg-white/5 border-white/5 text-white rounded-full text-[11px] font-bold hover:bg-white/10 transition-all focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#0f1115] border-white/10 rounded-xl shadow-2xl">
          {supportedLanguages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer py-2"
            >
              <div className="flex items-center justify-between w-full gap-3">
                <span className="font-medium">{lang.label}</span>
                <span className="text-[9px] opacity-30 font-serif lowercase tracking-tighter">{lang.nativeLabel}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
