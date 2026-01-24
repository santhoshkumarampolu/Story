'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ImageUpload } from '@/components/ImageUpload';
import { CloudinaryUploadResponse } from '@/lib/cloudinary';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageIcon, FileText, Sparkles, Upload, Maximize2, RefreshCw, Trash2 } from 'lucide-react';

interface StoryboardSectionProps {
  sceneId: string;
  sceneTitle?: string;
  script: string | null;
  summary: string | null;
  storyboard: string | null;
  projectType: string;
  supportsImages: boolean;
  onStoryboardUpdate: (storyboardContent: string) => Promise<void>;
  onGenerateTextStoryboard: () => Promise<void>;
  onGenerateImageStoryboard?: () => Promise<void>;
  isGenerating: boolean;
  isGeneratingImage?: boolean;
  onViewFullSize?: (imageUrl: string) => void;
  onClearStoryboard?: () => Promise<void>;
  imageQuota?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export function StoryboardSection({
  sceneId,
  sceneTitle,
  script,
  summary,
  storyboard,
  projectType,
  supportsImages,
  onStoryboardUpdate,
  onGenerateTextStoryboard,
  onGenerateImageStoryboard,
  isGenerating,
  isGeneratingImage = false,
  onViewFullSize,
  onClearStoryboard,
  imageQuota,
}: StoryboardSectionProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'text'>(supportsImages ? 'image' : 'text');

  // Check if storyboard is an image URL or text
  const isImageStoryboard = storyboard?.startsWith('http') || storyboard?.startsWith('data:image');
  const hasContent = !!storyboard;

  const handleUploadComplete = async (result: CloudinaryUploadResponse) => {
    try {
      setIsUploading(true);
      await onStoryboardUpdate(result.secure_url);
      toast({
        title: "Success",
        description: "Storyboard image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update storyboard",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    const input = document.getElementById(`storyboard-upload-${sceneId}`) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const canGenerate = !!(script || summary);
  const canGenerateImage = supportsImages && canGenerate && imageQuota && imageQuota.remaining > 0;

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium">Storyboard</span>
          {supportsImages && (
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
              <ImageIcon className="h-3 w-3 mr-1" />
              AI Images
            </Badge>
          )}
        </div>

        {/* Quota indicator for images */}
        {supportsImages && imageQuota && (
          <div className="text-xs text-gray-500">
            {imageQuota.remaining}/{imageQuota.limit} images left
          </div>
        )}
      </div>

      {/* Content area */}
      {hasContent ? (
        <div className="space-y-2">
          {isImageStoryboard ? (
            /* Image Storyboard Display */
            <div className="relative group">
              <div 
                className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 cursor-pointer bg-black/30"
                onClick={() => onViewFullSize?.(storyboard!)}
              >
                <img 
                  src={storyboard!} 
                  alt={`Storyboard for ${sceneTitle || 'scene'}`}
                  className="w-full h-full object-contain"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewFullSize?.(storyboard!);
                    }}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Full Size
                  </Button>
                  {onClearStoryboard && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearStoryboard();
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {/* Regenerate button */}
              {supportsImages && onGenerateImageStoryboard && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateImageStoryboard();
                  }}
                  disabled={isGeneratingImage || !canGenerateImage}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              )}
            </div>
          ) : (
            /* Text Storyboard Display */
            <div className="bg-black/30 rounded-lg border border-white/10 p-4">
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 text-sm font-sans">
                  {storyboard}
                </pre>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onGenerateTextStoryboard}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                {onClearStoryboard && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                    onClick={onClearStoryboard}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Generation Options */
        <div className="space-y-3">
          {supportsImages ? (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'text')}>
              <TabsList className="bg-black/30 border border-white/10">
                <TabsTrigger value="image" className="data-[state=active]:bg-purple-600">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  AI Image
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-blue-600">
                  <FileText className="h-4 w-4 mr-2" />
                  Shot List
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="mt-3">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">Generate Storyboard Image</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        AI will create a cinematic frame based on your scene description and script.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="ai"
                          onClick={onGenerateImageStoryboard}
                          disabled={isGeneratingImage || !canGenerateImage}
                        >
                          {isGeneratingImage ? (
                            <>
                              <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Image
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20"
                          onClick={triggerFileUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </>
                          )}
                        </Button>
                      </div>
                      {!canGenerate && (
                        <p className="text-xs text-amber-400 mt-2">
                          Add a scene summary or script first to generate storyboard.
                        </p>
                      )}
                      {canGenerate && imageQuota && imageQuota.remaining === 0 && (
                        <p className="text-xs text-red-400 mt-2">
                          You've used all your image generations this month. Upgrade your plan for more.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">Generate Shot List</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        AI will create detailed shot descriptions with camera angles and visual elements.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        onClick={onGenerateTextStoryboard}
                        disabled={isGenerating || !canGenerate}
                      >
                        {isGenerating ? (
                          <>
                            <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Shot List
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Text-only storyboard for non-visual project types */
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">Generate Shot Descriptions</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Create detailed visual descriptions for this scene.
                  </p>
                  <Button
                    size="sm"
                    variant="ai"
                    onClick={onGenerateTextStoryboard}
                    disabled={isGenerating || !canGenerate}
                  >
                    {isGenerating ? (
                      <>
                        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Icons.film className="h-4 w-4 mr-2" />
                        Generate Storyboard
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for upload */}
      <div className="hidden">
        <ImageUpload
          onUploadComplete={handleUploadComplete}
          onError={(error) => {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }}
          className="w-full"
        />
        <input 
          type="file" 
          id={`storyboard-upload-${sceneId}`}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Trigger the ImageUpload component
              const uploadWidget = document.querySelector(`[data-scene-id="${sceneId}"] input[type="file"]`) as HTMLInputElement;
              if (uploadWidget) {
                uploadWidget.files = e.target.files;
                uploadWidget.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }}
        />
      </div>
    </div>
  );
}
