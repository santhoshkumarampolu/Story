"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Lightbulb, Zap, Palette, Star } from "lucide-react";
import { toast } from "sonner";

interface GeneratedIdea {
  concept: string;
  conflict: string;
  emotionalHook: string;
  visualStyle: string;
  uniqueElement: string;
}

interface IdeaGeneratorProps {
  projectId: string;
  onIdeaGenerated?: (idea: string) => void;
  seedIdea?: string;
}

// Define the type for the exposed functions
export interface IdeaGeneratorHandle {
  triggerGenerate: () => void;
}

// Wrap the component with forwardRef
const IdeaGenerator = forwardRef<IdeaGeneratorHandle, IdeaGeneratorProps>(
  ({ projectId, onIdeaGenerated, seedIdea }, ref) => {
    const [generatorInput, setGeneratorInput] = useState(seedIdea || "");
    const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (seedIdea !== undefined) {
        setGeneratorInput(seedIdea);
      }
    }, [seedIdea]);

    const generateIdeas = async (random: boolean = false) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/ideas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idea: random ? "" : generatorInput,
            generateRandom: random,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate ideas");
        }

        const data = await response.json();
        setGeneratedIdeas(data.generatedIdeas);
      } catch (error) {
        toast.error("Failed to generate ideas. Please try again.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    // Expose the triggerGenerate function via useImperativeHandle
    useImperativeHandle(ref, () => ({
      triggerGenerate: () => {
        // Call the internal generateIdeas function.
        // If generatorInput (seeded by EditorPage's idea state) is empty, generate random ideas.
        // Otherwise, use the generatorInput as a seed.
        if (generatorInput.trim()) {
          generateIdeas(false);
        } else {
          generateIdeas(true); // Generate random ideas if input is empty
        }
      },
    }));

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">What's your idea or theme?</h3>
          <p className="text-sm text-muted-foreground">
            Enter anything that inspires you, or let AI help you generate ideas.
          </p>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Enter your idea or theme here to seed generation..."
            value={generatorInput}
            onChange={(e) => setGeneratorInput(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="flex gap-4">
            <Button
              onClick={() => generateIdeas(false)}
              disabled={isLoading || !generatorInput.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Ideas"
              )}
            </Button>

            <Button
              variant="ai"
              onClick={() => generateIdeas(true)}
              disabled={isLoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Inspire Me
            </Button>
          </div>
        </div>

        {generatedIdeas.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Generated Ideas</h4>
            <div className="grid gap-4">
              {generatedIdeas.map((generatedIdea, index) => (
                <Card key={index} className="p-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{generatedIdea.concept}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <div className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Conflict</p>
                          <p className="text-sm text-muted-foreground">{generatedIdea.conflict}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Emotional Hook</p>
                          <p className="text-sm text-muted-foreground">{generatedIdea.emotionalHook}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Palette className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Visual Style</p>
                          <p className="text-sm text-muted-foreground">{generatedIdea.visualStyle}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Star className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Unique Element</p>
                          <p className="text-sm text-muted-foreground">{generatedIdea.uniqueElement}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setGeneratorInput(generatedIdea.concept);
                        onIdeaGenerated?.(generatedIdea.concept);
                      }}
                    >
                      Use This Idea
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

IdeaGenerator.displayName = "IdeaGenerator"; // Add display name for better debugging

export { IdeaGenerator }; // Ensure it's exported correctly