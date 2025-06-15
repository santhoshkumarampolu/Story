"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/ui/icons';
import { GoogleTransliterateTextarea } from '@/components/GoogleTransliterateTextarea';
import { Plus, Save, Trash2, Book } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  summary: string;
  content: string;
  order: number;
  wordCount: number;
}

interface ChapterManagerProps {
  chapters: Chapter[];
  onChaptersChange: (chapters: Chapter[]) => void;
  onGenerateChapters: () => void;
  isGenerating: boolean;
  isSaving: boolean;
  onSave: () => void;
  transliterationEnabled: boolean;
  language: string;
  translate: (key: string) => string;
}

export function ChapterManager({
  chapters,
  onChaptersChange,
  onGenerateChapters,
  isGenerating,
  isSaving,
  onSave,
  transliterationEnabled,
  language,
  translate
}: ChapterManagerProps) {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `temp-chapter-${Date.now()}`,
      title: '',
      summary: '',
      content: '',
      order: chapters.length + 1,
      wordCount: 0
    };
    onChaptersChange([...chapters, newChapter]);
  };

  const updateChapter = (id: string, field: keyof Chapter, value: string | number) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === id) {
        const updated = { ...chapter, [field]: value };
        // Update word count if content changed
        if (field === 'content') {
          updated.wordCount = (value as string).split(/\s+/).filter(word => word.length > 0).length;
        }
        return updated;
      }
      return chapter;
    });
    onChaptersChange(updatedChapters);
  };

  const deleteChapter = (id: string) => {
    const updatedChapters = chapters.filter(chapter => chapter.id !== id);
    onChaptersChange(updatedChapters);
  };

  const toggleChapterExpansion = (id: string) => {
    setExpandedChapter(expandedChapter === id ? null : id);
  };

  const totalWordCount = chapters.reduce((total, chapter) => total + chapter.wordCount, 0);

  return (
    <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-purple-300 flex items-center">
              <Book className="h-5 w-5 mr-2" />
              {translate('Chapters')}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {chapters.length} {translate('chapters')} • {totalWordCount.toLocaleString()} {translate('words')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={onGenerateChapters}
              disabled={isGenerating || isSaving}
              variant="ai"
            >
              {isGenerating ? (
                <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
              ) : (
                <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Chapters')}</>
              )}
            </Button>
            <Button
              onClick={addChapter}
              variant="outline"
              className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
            >
              <Plus className="h-4 w-4 mr-2" /> {translate('Add Chapter')}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="bg-white/10 p-4 rounded-lg border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4 flex-1">
                  <Input
                    type="number"
                    value={chapter.order}
                    onChange={(e) => updateChapter(chapter.id, 'order', parseInt(e.target.value))}
                    className="w-16 bg-white/5 border-white/10 text-gray-300 text-xs"
                    placeholder="#"
                  />
                  <Input
                    value={chapter.title}
                    onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                    className="text-lg font-semibold bg-transparent border-0 p-0 text-white flex-1"
                    placeholder={translate(`Chapter ${index + 1} Title`)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {chapter.wordCount.toLocaleString()} {translate('words')}
                  </span>
                  <Button
                    onClick={() => toggleChapterExpansion(chapter.id)}
                    variant="ghost"
                    size="sm"
                    className="text-purple-300 hover:text-purple-200 hover:bg-purple-300/10"
                  >
                    {expandedChapter === chapter.id ? translate('Collapse') : translate('Expand')}
                  </Button>
                  <Button
                    onClick={() => deleteChapter(chapter.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Textarea
                value={chapter.summary}
                onChange={(e) => updateChapter(chapter.id, 'summary', e.target.value)}
                className="text-sm bg-white/5 border-white/10 text-gray-300 placeholder-gray-500 min-h-[60px] mb-3"
                placeholder={translate("Chapter summary...")}
              />

              {expandedChapter === chapter.id && (
                <div className="mt-4">
                  <GoogleTransliterateTextarea
                    id={`chapter-content-${chapter.id}`}
                    initialValue={chapter.content}
                    onValueChange={(value) => updateChapter(chapter.id, 'content', value)}
                    className="min-h-[300px] bg-white/5 border-white/10 text-gray-300 placeholder-gray-500 w-full p-3 rounded-md"
                    placeholder={translate("Write your chapter content here...")}
                    transliterationEnabled={transliterationEnabled && language !== 'English'}
                    destinationLanguage={language}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{translate('No chapters yet.')}</p>
            <p className="text-sm mt-2">{translate('Add chapters manually or generate a chapter breakdown.')}</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={onSave}
            disabled={isSaving || isGenerating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />{translate('Save Chapters')}</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
