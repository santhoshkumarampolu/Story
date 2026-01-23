"use client";

import { useState, useEffect } from 'react';
import EditorPageClient from './editor-client';
import { TranslationProvider } from '@/components/TranslationProvider';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function EditorWrapper({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const fetchProjectLanguage = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          // Ensure we always have a valid language, default to 'English' if null/undefined
          const projectLanguage = data.language || 'English';
          setCurrentLanguage(projectLanguage);
        }
      } catch (error) {
        console.error('Error fetching project language:', error);
        // Fallback to English if there's an error
        setCurrentLanguage('English');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
    fetchProjectLanguage();
    }
  }, [status, router, projectId]);

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <TranslationProvider key={currentLanguage} targetLanguage={currentLanguage} enabled={true}>
      <EditorPageClient 
        projectId={projectId} 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />
    </TranslationProvider>
  );
}