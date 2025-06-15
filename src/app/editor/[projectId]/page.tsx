import { Suspense, use } from 'react';
import { EditorPageClient } from './editor-client';
import { TranslationProvider } from '@/components/TranslationProvider';
import { EditorWrapper } from './editor-wrapper';

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorWrapper projectId={resolvedParams.projectId} />
    </Suspense>
  );
}