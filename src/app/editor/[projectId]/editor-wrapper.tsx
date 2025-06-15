"use client";

import { useState, useEffect } from 'react';
import { EditorPageClient } from './editor-client';
import { TranslationProvider } from '@/components/TranslationProvider';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface EditorWrapperProps {
  projectId: string;
}

export function EditorWrapper({ projectId }: EditorWrapperProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>("English");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch project language on mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    const fetchProjectLanguage = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setCurrentLanguage(data.language || "English");
      } catch (error) {
        console.error('Error fetching project language:', error);
        toast({
          title: "Error",
          description: "Failed to load project language settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectLanguage();
  }, [projectId, status, router, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <TranslationProvider language={currentLanguage} enabled={true}>
      <EditorPageClient projectId={projectId} />
    </TranslationProvider>
  );
}