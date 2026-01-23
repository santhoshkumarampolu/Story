"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Languages, Loader2, Copy, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ContentTranslatorProps {
  content: string;
  contentType: 'idea' | 'logline' | 'treatment' | 'synopsis' | 'script' | 'general';
  currentLanguage: string;
  onTranslated?: (translatedContent: string, targetLanguage: string) => void;
}

const supportedLanguages = [
  { code: 'English', label: 'English', nativeLabel: 'English' },
  { code: 'Telugu', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'Hindi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'Tamil', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'Kannada', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'Malayalam', label: 'Malayalam', nativeLabel: 'മലയാളം' },
];

export function ContentTranslator({ 
  content, 
  contentType, 
  currentLanguage,
  onTranslated 
}: ContentTranslatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const availableTargetLanguages = supportedLanguages.filter(
    lang => lang.code !== currentLanguage
  );

  const handleTranslate = async () => {
    if (!targetLanguage || !content) {
      toast.error("Please select a target language and ensure there's content to translate.");
      return;
    }

    setIsTranslating(true);
    setTranslatedContent('');

    try {
      const response = await fetch('/api/translate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          sourceLanguage: currentLanguage || 'English',
          targetLanguage,
          contentType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedContent(data.translatedContent);

      toast.success(`Content translated to ${targetLanguage} successfully.`);

    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(error.message || "Failed to translate content. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Translated content copied to clipboard.");
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleUseTranslation = () => {
    if (onTranslated && translatedContent) {
      onTranslated(translatedContent, targetLanguage);
      setIsOpen(false);
      setTranslatedContent('');
      setTargetLanguage('');
      toast.success(`Content replaced with ${targetLanguage} translation.`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
          disabled={!content}
        >
          <Languages className="h-4 w-4" />
          Translate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Languages className="h-5 w-5 text-blue-400" />
            Translate Content
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Translate your {contentType} to another language while preserving tone and context.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Language Selection */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">From:</span>
              <div className="px-3 py-2 bg-gray-800 rounded-md text-white text-sm">
                {currentLanguage || 'English'}
              </div>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-500" />
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">To:</span>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {availableTargetLanguages.map((lang) => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      className="text-white hover:bg-gray-700 focus:bg-gray-700"
                    >
                      {lang.label} ({lang.nativeLabel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleTranslate}
              disabled={!targetLanguage || isTranslating || !content}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
          </div>

          {/* Original Content Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Original Content ({currentLanguage || 'English'}):
            </label>
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                {content?.substring(0, 500)}{content?.length > 500 ? '...' : ''}
              </p>
            </div>
            {content?.length > 500 && (
              <p className="text-xs text-gray-500">
                Showing first 500 characters of {content.length} total
              </p>
            )}
          </div>

          {/* Translated Content */}
          {translatedContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Translated Content ({targetLanguage}):
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <Textarea
                value={translatedContent}
                readOnly
                className="min-h-[200px] bg-gray-800 border-gray-600 text-white resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {translatedContent && onTranslated && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUseTranslation}
              className="bg-green-600 hover:bg-green-700"
            >
              Use This Translation
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
