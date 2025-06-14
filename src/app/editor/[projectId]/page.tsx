import { Suspense, use } from 'react';
import { EditorPageClient } from './editor-client';

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorPageClient projectId={resolvedParams.projectId} />
    </Suspense>
  );
}