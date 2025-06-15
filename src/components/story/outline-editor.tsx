"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/ui/icons';
import { GoogleTransliterateTextarea } from '@/components/GoogleTransliterateTextarea';
import { Plus, Save, Trash2 } from 'lucide-react';

interface OutlineBeat {
  id: string;
  title: string;
  description: string;
  order: number;
  beatType: string;
}

interface OutlineEditorProps {
  beats: OutlineBeat[];
  onBeatsChange: (beats: OutlineBeat[]) => void;
  onGenerateOutline: () => void;
  isGenerating: boolean;
  isSaving: boolean;
  onSave: () => void;
  transliterationEnabled: boolean;
  language: string;
  translate: (key: string) => string;
}

export function OutlineEditor({
  beats,
  onBeatsChange,
  onGenerateOutline,
  isGenerating,
  isSaving,
  onSave,
  transliterationEnabled,
  language,
  translate
}: OutlineEditorProps) {
  const addBeat = () => {
    const newBeat: OutlineBeat = {
      id: `temp-beat-${Date.now()}`,
      title: '',
      description: '',
      order: beats.length,
      beatType: 'plot-point'
    };
    onBeatsChange([...beats, newBeat]);
  };

  const updateBeat = (id: string, field: keyof OutlineBeat, value: string | number) => {
    const updatedBeats = beats.map(beat =>
      beat.id === id ? { ...beat, [field]: value } : beat
    );
    onBeatsChange(updatedBeats);
  };

  const deleteBeat = (id: string) => {
    const updatedBeats = beats.filter(beat => beat.id !== id);
    onBeatsChange(updatedBeats);
  };

  return (
    <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-purple-300 flex items-center">
            <Icons.fileText className="h-5 w-5 mr-2" />
            {translate('Story Outline')}
          </h2>
          <div className="flex space-x-2">
            <Button
              onClick={onGenerateOutline}
              disabled={isGenerating || isSaving}
              variant="ai"
            >
              {isGenerating ? (
                <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
              ) : (
                <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Outline')}</>
              )}
            </Button>
            <Button
              onClick={addBeat}
              variant="outline"
              className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
            >
              <Plus className="h-4 w-4 mr-2" /> {translate('Add Beat')}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {beats.map((beat, index) => (
            <div key={beat.id} className="bg-white/10 p-4 rounded-lg border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Input
                  value={beat.title}
                  onChange={(e) => updateBeat(beat.id, 'title', e.target.value)}
                  className="text-lg font-semibold bg-transparent border-0 p-0 text-white flex-1 mr-4"
                  placeholder={translate(`Beat ${index + 1} Title`)}
                />
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={beat.order}
                    onChange={(e) => updateBeat(beat.id, 'order', parseInt(e.target.value))}
                    className="w-16 bg-white/5 border-white/10 text-gray-300 text-xs"
                    placeholder="#"
                  />
                  <select
                    value={beat.beatType}
                    onChange={(e) => updateBeat(beat.id, 'beatType', e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-300 text-xs rounded px-2 py-1"
                  >
                    <option value="opening">Opening</option>
                    <option value="inciting-incident">Inciting Incident</option>
                    <option value="plot-point">Plot Point</option>
                    <option value="midpoint">Midpoint</option>
                    <option value="climax">Climax</option>
                    <option value="resolution">Resolution</option>
                  </select>
                  <Button
                    onClick={() => deleteBeat(beat.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <GoogleTransliterateTextarea
                id={`beat-description-${beat.id}`}
                initialValue={beat.description}
                onValueChange={(value) => updateBeat(beat.id, 'description', value)}
                className="min-h-[80px] bg-white/5 border-white/10 text-gray-300 placeholder-gray-500 w-full p-2 rounded-md"
                placeholder={translate("Describe what happens in this beat...")}
                transliterationEnabled={transliterationEnabled && language !== 'English'}
                destinationLanguage={language}
              />
            </div>
          ))}
        </div>

        {beats.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Icons.fileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{translate('No story beats yet.')}</p>
            <p className="text-sm mt-2">{translate('Add beats manually or generate an outline.')}</p>
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
              <><Save className="h-4 w-4 mr-2" />{translate('Save Outline')}</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
