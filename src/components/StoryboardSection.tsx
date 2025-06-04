import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ImageUpload } from '@/components/ImageUpload';
import { CloudinaryUploadResponse } from '@/lib/cloudinary';
import { useToast } from '@/components/ui/use-toast';

interface StoryboardSectionProps {
  sceneId: string;
  script: string | null;
  storyboard: string | null;
  onStoryboardUpdate: (storyboardUrl: string) => Promise<void>;
  onGenerateStoryboard: () => Promise<void>;
  isGenerating: boolean;
  onViewFullSize?: (storyboardUrl: string) => void;
}

export function StoryboardSection({
  sceneId,
  script,
  storyboard,
  onStoryboardUpdate,
  onGenerateStoryboard,
  isGenerating,
  onViewFullSize
}: StoryboardSectionProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = async (result: CloudinaryUploadResponse) => {
    try {
      setIsUploading(true);
      await onStoryboardUpdate(result.secure_url);
      toast({
        title: "Success",
        description: "Storyboard uploaded successfully",
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

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-400">Storyboard</div>
        <div className="flex space-x-2">
          {!storyboard ? (
            <>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={onGenerateStoryboard}
                disabled={isGenerating || !script}
              >
                {isGenerating ? (
                  <>
                    <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Icons.film className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20"
                onClick={() => document.getElementById(`upload-${sceneId}`)?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Icons.plus className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => onViewFullSize?.(storyboard)}
            >
              <Icons.maximize className="h-4 w-4 mr-2" />
              View Full Size
            </Button>
          )}
        </div>
      </div>

      {storyboard ? (
        <div 
          className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 cursor-pointer"
          onClick={() => onViewFullSize?.(storyboard)}
        >
          <img 
            src={storyboard} 
            alt="Storyboard" 
            className="w-full h-full object-contain bg-black/50"
          />
        </div>
      ) : (
        <div id={`upload-${sceneId}`} className="hidden">
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
        </div>
      )}
    </div>
  );
} 