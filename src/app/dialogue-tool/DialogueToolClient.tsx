'use client';

import { useState } from 'react';
import DialogueToolLanding from '@/components/DialogueToolLanding';
import { TranslationProvider } from '@/components/TranslationProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Header } from '@/components/layout/header';

export default function DialogueToolClient() {
  const [language, setLanguage] = useState('English');
  
  // Map language names to codes for translation system
  const getLanguageCode = (lang: string) => {
    const mapping: Record<string, string> = {
      'English': 'en',
      'Hindi': 'hi',
      'Telugu': 'te',
      'Tamil': 'ta',
      'Kannada': 'kn',
      'Malayalam': 'ml'
    };
    return mapping[lang] || 'en';
  };

  return (
    <TranslationProvider targetLanguage={getLanguageCode(language)} enabled={true}>
      <Header />
      <main className="min-h-screen bg-background pt-10">
        <div className="flex justify-end px-4 max-w-7xl mx-auto mb-4">
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
        <section className="pb-20">
          <DialogueToolLanding language={getLanguageCode(language)} />
        </section>
      </main>
    </TranslationProvider>
  );
}
