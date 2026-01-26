"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare, Sparkles, Users, Copy, RefreshCw,
  Volume2, FileText, Lightbulb, X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Character {
  id?: string;
  name: string;
  description?: string;
}

interface DialogueWriterProps {
  projectId: string;
  sceneId?: string;
  characters?: Character[];
  onDialogueGenerated?: (dialogue: string) => void;
  className?: string;
}

const TONE_OPTIONS = [
  { value: 'emotional', label: 'Emotional', description: 'Deep feelings, vulnerability' },
  { value: 'comedy', label: 'Comedy', description: 'Humorous, witty banter' },
  { value: 'love', label: 'Romantic', description: 'Tender, affectionate' },
  { value: 'witty', label: 'Witty', description: 'Clever wordplay, sarcasm' },
  { value: 'dramatic', label: 'Dramatic', description: 'Intense, serious' },
  { value: 'action', label: 'Action', description: 'Fast-paced, urgent' },
  { value: 'suspense', label: 'Suspense', description: 'Tense, mysterious' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short', description: 'Brief exchanges (2-4 lines)' },
  { value: 'medium', label: 'Medium', description: 'Moderate conversations (4-8 lines)' },
  { value: 'long', label: 'Long', description: 'Extended dialogues (8+ lines)' },
];

export default function DialogueWriter({
  projectId,
  sceneId,
  characters = [],
  onDialogueGenerated,
  className
}: DialogueWriterProps) {
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [generatedDialogue, setGeneratedDialogue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterInput, setCharacterInput] = useState('');
  const { toast } = useToast();

  // Auto-select first few characters if available
  useEffect(() => {
    if (characters.length > 0 && selectedCharacters.length === 0) {
      setSelectedCharacters(characters.slice(0, 3)); // Default to first 3 characters
    }
  }, [characters, selectedCharacters.length]);

  const addCharacter = () => {
    if (characterInput.trim()) {
      const newChar: Character = { name: characterInput.trim() };
      setSelectedCharacters([...selectedCharacters, newChar]);
      setCharacterInput('');
    }
  };

  const removeCharacter = (index: number) => {
    setSelectedCharacters(selectedCharacters.filter((_, i) => i !== index));
  };

  const generateDialogue = async () => {
    if (!context.trim() || !tone || !length || selectedCharacters.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide scene context, select tone, length, and at least one character.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-dialogue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sceneId,
          context,
          tone,
          length,
          characters: selectedCharacters,
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate dialogue');
      }

      setGeneratedDialogue(data.dialogue);
      onDialogueGenerated?.(data.dialogue);

      toast({
        title: "Dialogue Generated!",
        description: "Your AI-generated dialogue is ready.",
      });

    } catch (error) {
      console.error('Error generating dialogue:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate dialogue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDialogue);
      toast({
        title: "Copied!",
        description: "Dialogue copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Dialogue Writer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scene Context */}
        <div className="space-y-2">
          <Label htmlFor="context" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scene Context
          </Label>
          <Textarea
            id="context"
            placeholder="Describe the scene setting, what's happening, character motivations, and what the dialogue should accomplish..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Tone and Length Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tone
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select dialogue tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Length
            </Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger>
                <SelectValue placeholder="Select dialogue length" />
              </SelectTrigger>
              <SelectContent>
                {LENGTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Characters Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Characters in Scene
          </Label>

          {/* Selected Characters */}
          {selectedCharacters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCharacters.map((character, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeCharacter(index)}
                >
                  {character.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Add Character Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add character name..."
              value={characterInput}
              onChange={(e) => setCharacterInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCharacter}
              disabled={!characterInput.trim()}
            >
              Add
            </Button>
          </div>

          {/* Available Characters */}
          {characters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Available characters:</Label>
              <div className="flex flex-wrap gap-2">
                {characters
                  .filter(char => !selectedCharacters.some(selected => selected.name === char.name))
                  .map((character) => (
                    <Badge
                      key={character.id || character.name}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSelectedCharacters([...selectedCharacters, character])}
                    >
                      + {character.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Additional Instructions (Optional)
          </Label>
          <Textarea
            id="instructions"
            placeholder="Any specific requirements, character personalities, or dialogue style preferences..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <Separator />

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateDialogue}
            disabled={isGenerating || !context.trim() || !tone || !length || selectedCharacters.length === 0}
            size="lg"
            className="min-w-48"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Dialogue...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Dialogue
              </>
            )}
          </Button>
        </div>

        {/* Generated Dialogue */}
        <AnimatePresence>
          {generatedDialogue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Generated Dialogue</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {generatedDialogue}
                  </pre>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}