"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LanguageSwitcherProps {
  currentLanguage: string | null | undefined;
  onLanguageChange: (language: string) => void;
}

const supportedLanguages = [
  { code: 'English', label: 'English', nativeLabel: 'English' },
  { code: 'Telugu', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'Hindi', label: 'Hindi', nativeLabel: 'हिंदी' },
];

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  // Default to 'English' if currentLanguage is null, undefined, or empty
  const selectedLanguage = currentLanguage || 'English';
  
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-400">Language:</span>
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-40 bg-white/10 border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-black/95 border-white/10">
          {supportedLanguages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="text-white hover:bg-white/10 focus:bg-white/10"
            >
              <div className="flex items-center space-x-4">
                <span>{lang.label}</span>
                <span className="text-xs opacity-70">({lang.nativeLabel})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
