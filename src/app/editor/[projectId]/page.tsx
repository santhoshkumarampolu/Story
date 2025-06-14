import { Suspense, use } from 'react';
import { EditorPageClient } from './editor-client';

export default function EditorPage({ params }: { params: { projectId: string } }) {
  const resolvedParams = use(Promise.resolve(params));
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorPageClient projectId={resolvedParams.projectId} />
    </Suspense>
  );
}