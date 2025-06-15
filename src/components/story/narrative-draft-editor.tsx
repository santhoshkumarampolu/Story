"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { GoogleTransliterateTextarea } from '@/components/GoogleTransliterateTextarea';
import { Save, FileText, Plus } from 'lucide-react';

interface NarrativeDraft {
  id: string;
  title: string;
  content: string;
  draftType: 'first' | 'revised' | 'final';
  version: number;
  wordCount: number;
}

interface NarrativeDraftEditorProps {
  drafts: NarrativeDraft[];
  onDraftsChange: (drafts: NarrativeDraft[]) => void;
  onGenerateDraft: () => void;
  isGenerating: boolean;
  isSaving: boolean;
  onSave: () => void;
  transliterationEnabled: boolean;
  language: string;
  translate: (key: string) => string;
}

export function NarrativeDraftEditor({
  drafts,
  onDraftsChange,
  onGenerateDraft,
  isGenerating,
  isSaving,
  onSave,
  transliterationEnabled,
  language,
  translate
}: NarrativeDraftEditorProps) {
  const [activeDraft, setActiveDraft] = useState<string>(drafts[0]?.id || '');

  const addDraft = () => {
    const newDraft: NarrativeDraft = {
      id: `temp-draft-${Date.now()}`,
      title: `Draft ${drafts.length + 1}`,
      content: '',
      draftType: 'first',
      version: 1,
      wordCount: 0
    };
    onDraftsChange([...drafts, newDraft]);
    setActiveDraft(newDraft.id);
  };

  const updateDraft = (id: string, field: keyof NarrativeDraft, value: string | number) => {
    const updatedDrafts = drafts.map(draft => {
      if (draft.id === id) {
        const updated = { ...draft, [field]: value };
        // Update word count if content changed
        if (field === 'content') {
          updated.wordCount = (value as string).split(/\s+/).filter(word => word.length > 0).length;
        }
        return updated;
      }
      return draft;
    });
    onDraftsChange(updatedDrafts);
  };

  const currentDraft = drafts.find(draft => draft.id === activeDraft);

  return (
    <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-purple-300 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {translate('Narrative Draft')}
          </h2>
          <div className="flex space-x-2">
            <Button
              onClick={onGenerateDraft}
              disabled={isGenerating || isSaving}
              variant="ai"
            >
              {isGenerating ? (
                <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
              ) : (
                <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Draft')}</>
              )}
            </Button>
            <Button
              onClick={addDraft}
              variant="outline"
              className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
            >
              <Plus className="h-4 w-4 mr-2" /> {translate('New Draft')}
            </Button>
          </div>
        </div>

        {/* Draft Tabs */}
        {drafts.length > 1 && (
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {drafts.map((draft) => (
              <Button
                key={draft.id}
                onClick={() => setActiveDraft(draft.id)}
                variant={activeDraft === draft.id ? "default" : "ghost"}
                size="sm"
                className={activeDraft === draft.id 
                  ? "bg-purple-600 text-white" 
                  : "text-gray-300 hover:text-white hover:bg-white/5"
                }
              >
                {draft.title}
              </Button>
            ))}
          </div>
        )}

        {currentDraft ? (
          <div className="space-y-4">
            {/* Draft Header */}
            <div className="flex items-center space-x-4">
              <Input
                value={currentDraft.title}
                onChange={(e) => updateDraft(currentDraft.id, 'title', e.target.value)}
                className="text-lg font-semibold bg-white/5 border-white/10 text-white flex-1"
                placeholder={translate("Draft Title")}
              />
              <select
                value={currentDraft.draftType}
                onChange={(e) => updateDraft(currentDraft.id, 'draftType', e.target.value as 'first' | 'revised' | 'final')}
                className="bg-white/5 border border-white/10 text-gray-300 rounded px-3 py-2"
              >
                <option value="first">{translate('First Draft')}</option>
                <option value="revised">{translate('Revised Draft')}</option>
                <option value="final">{translate('Final Draft')}</option>
              </select>
              <span className="text-sm text-gray-400 whitespace-nowrap">
                {currentDraft.wordCount.toLocaleString()} {translate('words')}
              </span>
            </div>

            {/* Draft Content */}
            <GoogleTransliterateTextarea
              id={`draft-content-${currentDraft.id}`}
              initialValue={currentDraft.content}
              onValueChange={(value) => updateDraft(currentDraft.id, 'content', value)}
              className="min-h-[500px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full p-4 rounded-md"
              placeholder={translate("Write your story here...")}
              transliterationEnabled={transliterationEnabled && language !== 'English'}
              destinationLanguage={language}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{translate('No drafts yet.')}</p>
            <p className="text-sm mt-2">{translate('Create a new draft to start writing.')}</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={onSave}
            disabled={isSaving || isGenerating || !currentDraft}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />{translate('Save Draft')}</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
