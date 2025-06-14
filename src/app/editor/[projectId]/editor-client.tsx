"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { IdeaGenerator, IdeaGeneratorHandle } from '@/components/ideas/idea-generator';
import { Save, Share2, Download, Plus, Pencil, Trash2, AlertCircle as IAlertCircle } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { GoogleTransliterateTextarea } from '@/components/GoogleTransliterateTextarea';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TokenAnimationDisplay } from '@/components/TokenAnimationDisplay';
import { AIOperationProgress } from '@/components/AIOperationProgress';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from "@/lib/utils";

// Define types based on Prisma schema
type ProjectType = "shortfilm" | "story" | "screenplay";
type CardType = "story" | "scene" | "act" | "dialogue" | "shortfilm" | "advertisement";

interface ProjectCard {
  id: string;
  type: CardType;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Scene {
  id: string;
  title: string;
  summary: string;
  script: string | null;
  storyboard: string | null;
  order: number;
  act: string | null;
  location: string | null;
  timeOfDay: string | null;
  goals: string | null;
  conflicts: string | null;
  notes: string | null;
  version: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  isSummaryExpanded: boolean;
  isStoryboardExpanded: boolean;
  isScriptExpanded?: boolean;
}

interface Character {
  id: string;
  name: string;
  description: string;
  backstory?: string;
  motivation?: string;
  createdAt: string;
  updatedAt: string;
  clientId?: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  type: string;
  logline: string | null;
  idea: string | null;
  treatment: string | null;
  structureType: string | null;
  userId: string;
  cards: ProjectCard[];
  stories: { id: string; title: string; content: string; createdAt: string; updatedAt: string }[];
  scenes: Scene[];
  characters: Character[];
}

interface TokenUsage {
  usage: Array<{
    id: string;
    type: string;
    tokens: number;
    cost: number;
    createdAt: string;
  }>;
  totalTokens: number;
  totalCost: number;
}

interface TokenUpdate {
  id: string;
  tokens: number;
  cost: number;
  timestamp: number;
  type: "script" | "storyboard" | "treatment" | "idea" | "logline" | "character_generation" | "scenes";
  operation: string;
}

interface ShareLink {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface GeneratedIdea {
  Title: string;
  Concept: string;
  Conflict?: string;
  EmotionalHook?: string;
  VisualStyle?: string;
  UniqueElement?: string;
}

export function EditorPageClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [idea, setIdea] = useState<string>("");
  const [logline, setLogline] = useState<string>("");
  const [treatment, setTreatment] = useState<string>("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [savingScene, setSavingScene] = useState<string | null>(null);
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);
  const [generatingStoryboard, setGeneratingStoryboard] = useState<string | null>(null);
  const [selectedStoryboard, setSelectedStoryboard] = useState<string | null>(null);
  const [isTransliterationEnabled, setIsTransliterationEnabled] = useState(false);
  const [currentProjectLanguage, setCurrentProjectLanguage] = useState<string>("English");
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const [generatingLogline, setGeneratingLogline] = useState(false);
  const [savingLogline, setSavingLogline] = useState(false);
  const [generatingTreatment, setGeneratingTreatment] = useState(false);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [generatingCharacters, setGeneratingCharacters] = useState(false);
  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [savingSceneId, setSavingSceneId] = useState<string | null>(null); // New state for specific scene saving
  const [savingCharacterId, setSavingCharacterId] = useState<string | null>(null); // New state for specific character saving
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);

  // Function to handle character field changes
  const handleCharacterChange = (characterId: string, field: keyof Character, value: string) => {
    setCharacters(prevCharacters =>
      prevCharacters.map(char =>
        (char.id === characterId || char.clientId === characterId) ? { ...char, [field]: value } : char
      )
    );
  };

  // Function to handle scene field changes
  const handleSceneChange = (sceneId: string, field: keyof Scene, value: string) => {
    setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === sceneId ? { ...scene, [field]: value } : scene
      )
    );
  };

  const [tokenUpdates, setTokenUpdates] = useState<TokenUpdate[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'slideshow' | 'compare'>('single');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [compareStoryboard, setCompareStoryboard] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [shareExpiresIn, setShareExpiresIn] = useState(7);
  const [creatingShare, setCreatingShare] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx'>('pdf');
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const ideaGeneratorRef = useRef<IdeaGeneratorHandle>(null);

  // Translation hook setup
  const { translate, isTranslating, translateAsync, preloadTranslations } = useTranslation({
    targetLanguage: currentProjectLanguage,
    enabled: !!(currentProjectLanguage && currentProjectLanguage !== 'English')
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data: Project = await response.json();
        setProject(data);
        setIdea(data.idea || "");
        setLogline(data.logline || "");
        setTreatment(data.treatment || "");
        setCharacters(data.characters || []);
        setScenes(data.scenes.map(s => ({ ...s, isSummaryExpanded: false, isStoryboardExpanded: false, isScriptExpanded: false })) || []);
        setCurrentProjectLanguage(data.language || "English");
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: translate("Error"),
          description: translate("Failed to load project"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, toast, translate, router, status]);

  const updateTokenUsage = async (operationType?: string, operationName?: string) => { /* Placeholder */ };
  const handleLanguageChange = async (newLanguage: string) => { 
    setCurrentProjectLanguage(newLanguage);
    setProject(prev => prev ? {...prev, language: newLanguage} : null);
    toast({ title: "Language Updated (Placeholder)", description: `Language changed to ${newLanguage}`});
  };
  
  const generateIdeaApiCall = async () => { 
    setGeneratingIdea(true); 
    console.log("Generating idea..."); 
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setGeneratingIdea(false);
    toast({title: "Idea generation (Placeholder)"});
  };
  const saveIdeaApiCall = async () => { 
    setSavingIdea(true); 
    console.log("Saving idea...", idea); 
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setSavingIdea(false);
    toast({title: "Idea saved (Placeholder)"});
  };
  const generateLoglineApiCall = async () => { 
    setGeneratingLogline(true); 
    console.log("Generating logline..."); 
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setGeneratingLogline(false);
    toast({title: "Logline generation (Placeholder)"});
  };
  const saveLoglineApiCall = async () => { 
    setSavingLogline(true); 
    console.log("Saving logline...", logline); 
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setSavingLogline(false);
    toast({title: "Logline saved (Placeholder)"});
  };
  const generateTreatmentApiCall = async () => { 
    setGeneratingTreatment(true); 
    console.log("Generating treatment..."); 
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setGeneratingTreatment(false);
    toast({title: "Treatment generation (Placeholder)"});
  };
  const saveTreatmentApiCall = async () => { 
    setSavingTreatment(true); 
    console.log("Saving treatment...", treatment); 
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setSavingTreatment(false);
    toast({title: "Treatment saved (Placeholder)"});
  };
   const generateCharactersApiCall = async () => {
    setGeneratingCharacters(true);
    console.log("Generating characters...");
    // Placeholder: Replace with actual API call
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logline: project?.logline,
          treatment: project?.treatment,
          existingCharacters: characters.map(c => ({ name: c.name, description: c.description })),
          language: currentProjectLanguage,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate characters');
      }
      const data = await response.json();
      // Assuming the API returns an array of characters
      // And new characters might not have an ID yet, use a temporary clientId
      const newCharactersWithClientId = data.characters.map((char: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => ({
        ...char,
        clientId: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(), // Placeholder, ideally from server
        updatedAt: new Date().toISOString(), // Placeholder
      }));
      setCharacters(prev => [...prev, ...newCharactersWithClientId]);
      toast({ title: translate("Success"), description: translate("Characters generated successfully!") });
      updateTokenUsage("character_generation", "Generate Characters");
    } catch (error: any) {
      console.error("Error generating characters:", error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to generate characters."),
        variant: "destructive",
      });
    } finally {
      setGeneratingCharacters(false);
    }
  };
  const addCharacterApiCall = async () => {
    // Placeholder: Implement actual logic to add a character manually
    const newCharacter: Character = {
      id: `manual-${Date.now()}`, // Temporary ID, will be replaced by DB ID on save
      clientId: `temp-manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: translate('New Character'),
      description: '',
      backstory: '',
      motivation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCharacters(prev => [...prev, newCharacter]);
    toast({ title: translate("Character Added (Locally)"), description: translate("Save to persist changes.") });
  };
  const generateScenesApiCall = async () => {
    if (!idea || !logline || !treatment || characters.length === 0) {
      toast({
        title: translate("Cannot Generate Scenes"),
        description: translate("Idea, Logline, Treatment, and at least one Character are required to generate scenes."),
        variant: "destructive",
      });
      return;
    }
    setGeneratingScenes(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea, // Use state variable 'idea'
          logline: logline, // Use state variable 'logline'
          treatment: treatment, // Use state variable 'treatment'
          characters: characters.map(c => ({ name: c.name, description: c.description, backstory: c.backstory, motivation: c.motivation })),
          language: currentProjectLanguage,
          numScenes: 10 // Example: make this configurable later
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate scenes');
      }

      const data = await response.json();
      // Assuming API returns { scenes: Scene[] }
      const newScenes = data.scenes.map((scene: any, index: number) => ({
        ...scene,
        id: `temp-scene-${Date.now()}-${index}`, // Temporary ID
        order: (scenes.length > 0 ? Math.max(...scenes.map(s => s.order)) : 0) + index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSummaryExpanded: false,
        isStoryboardExpanded: false,
        isScriptExpanded: false,
      }));
      setScenes(prevScenes => [...prevScenes, ...newScenes]);
      toast({ title: translate("Success"), description: translate("Scenes generated successfully!") });
      updateTokenUsage("scenes", "Generate Scenes");
    } catch (error: any) {
      console.error("Error generating scenes:", error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to generate scenes."),
        variant: "destructive",
      });
    } finally {
      setGeneratingScenes(false);
    }
  };
  const addSceneApiCall = async () => {
    // Placeholder: Implement actual logic to add a scene manually
    const newScene: Scene = {
      id: `manual-scene-${Date.now()}`,
      title: translate('New Scene'),
      summary: '',
      script: null,
      storyboard: null,
      order: (scenes.length > 0 ? Math.max(...scenes.map(s => s.order)) : 0) + 1,
      act: null,
      location: null,
      timeOfDay: null,
      goals: null,
      conflicts: null,
      notes: null,
      version: 1,
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSummaryExpanded: true,
      isStoryboardExpanded: false,
      isScriptExpanded: false,
    };
    setScenes(prev => [...prev, newScene]);
    toast({ title: translate("Scene Added (Locally)"), description: translate("Save to persist changes.") });
  };

  const saveCharacterApiCall = async (characterToSave: Character) => {
    setSavingCharacterId(characterToSave.clientId || characterToSave.id);
    console.log("Saving character...", characterToSave);

    const isNewCharacter = characterToSave.id.startsWith('temp-') || characterToSave.id.startsWith('manual-') || !!characterToSave.clientId;
    const apiUrl = isNewCharacter
      ? `/api/projects/${projectId}/characters`
      : `/api/projects/${projectId}/characters/${characterToSave.id}`;
    const httpMethod = isNewCharacter ? 'POST' : 'PATCH';

    try {
      // Remove temporary clientId if it exists, the backend uses 'id' from the path for PATCH
      // or generates a new 'id' for POST.
      const { clientId, ...characterDataForApi } = characterToSave;

      const response = await fetch(apiUrl, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterDataForApi),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isNewCharacter ? 'create' : 'update'} character`);
      }

      const savedCharacter = await response.json();

      setCharacters(prevCharacters =>
        prevCharacters.map(char =>
          (char.id === characterToSave.id || char.clientId === characterToSave.clientId) 
            ? { ...savedCharacter, id: savedCharacter.id, clientId: undefined } // Ensure clientId is removed/undefined after save
            : char
        )
      );

      toast({
        title: translate("Success"),
        description: translate(`Character "${savedCharacter.name}" ${isNewCharacter ? 'created' : 'updated'} successfully.`),
      });
    } catch (error: any) {
      console.error(`Error ${isNewCharacter ? 'creating' : 'updating'} character:`, error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to save character."),
        variant: "destructive",
      });
    } finally {
      setSavingCharacterId(null);
    }
  };

  const saveSceneApiCall = async (sceneToSave: Scene) => {
    setSavingSceneId(sceneToSave.id);
    console.log("Saving scene...", sceneToSave);

    const isNewScene = sceneToSave.id.startsWith('temp-') || sceneToSave.id.startsWith('manual-');
    const apiUrl = isNewScene
      ? `/api/projects/${projectId}/scenes`
      : `/api/projects/${projectId}/scenes/${sceneToSave.id}`;
    const httpMethod = isNewScene ? 'POST' : 'PATCH';

    try {
      // Remove temporary client-side flags before sending to backend
      const { isSummaryExpanded, isStoryboardExpanded, isScriptExpanded, ...sceneDataForApi } = sceneToSave;

      const response = await fetch(apiUrl, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sceneDataForApi),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isNewScene ? 'create' : 'update'} scene`);
      }

      const savedScene = await response.json();

      setScenes(prevScenes =>
        prevScenes.map(s =>
          s.id === sceneToSave.id ? { ...s, ...savedScene, id: savedScene.id } : s
        )
      );

      toast({
        title: translate("Success"),
        description: translate(`Scene "${savedScene.title}" ${isNewScene ? 'created' : 'updated'} successfully.`),
      });
    } catch (error: any) {
      console.error(`Error ${isNewScene ? 'creating' : 'updating'} scene:`, error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to save scene."),
        variant: "destructive",
      });
    } finally {
      setSavingSceneId(null);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Icons.loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <IAlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl">{translate('Project not found or access denied.')}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          {translate('Go to Dashboard')}
        </Button>
      </div>
    );
  }


  return (
    <ScrollArea className="h-full bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <AIOperationProgress
          isGenerating={!!generatingScript || !!generatingStoryboard || generatingTreatment || generatingIdea || generatingLogline || generatingCharacters || generatingScenes}
          operationType={
            generatingScript ? "script" : 
            generatingStoryboard ? "storyboard" : 
            generatingTreatment ? "treatment" : 
            generatingIdea ? "idea" : 
            generatingLogline ? "logline" :
            generatingCharacters ? "character_generation" :
            generatingScenes ? "scenes" : // Added scenes
            "script" // Default
          }
          operationName={
            generatingScript ? translate("Script Generation") :
            generatingStoryboard ? translate("Storyboard Generation") :
            generatingTreatment ? translate("Treatment Generation") :
            generatingIdea ? translate("Idea Generation") : 
            generatingLogline ? translate("Logline Generation") :
            generatingCharacters ? translate("Character Generation") :
            generatingScenes ? translate("Scene Generation") : // Added scenes
            translate("AI Generation") // Default
          }
        />
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Icons.arrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold text-white">{project.title}</h1>
                <LanguageSelector
                  value={currentProjectLanguage}
                  onChange={handleLanguageChange}
                  variant="button"
                  size="sm"
                />
                {currentProjectLanguage === "Telugu" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTransliterationEnabled(!isTransliterationEnabled)}
                    className={cn(
                      "ml-2",
                      isTransliterationEnabled ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isTransliterationEnabled ? translate("Disable") : translate("Enable")} {translate("Tenglish")}
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <TokenAnimationDisplay 
                  tokenUsage={tokenUsage} 
                  tokenUpdates={tokenUpdates} 
                />
                {saving && (
                  <span className="text-sm text-gray-400 flex items-center">
                    <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                    {translate("Saving...")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          {/* IDEA */}
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.lightbulb className="h-5 w-5 mr-2" />
                  {translate('Idea')}
                </h2>
                <Button
                  onClick={generateIdeaApiCall}
                  disabled={generatingIdea || savingIdea}
                  variant="ai"
                >
                  {generatingIdea ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Idea')}</>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="idea-textarea"
                  initialValue={idea}
                  onValueChange={setIdea}
                  className="min-h-[150px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={translate("Describe your film\'s idea...")}
                  transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                  destinationLanguage={currentProjectLanguage}
                />
                <Button
                  onClick={saveIdeaApiCall}
                  disabled={savingIdea || generatingIdea}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingIdea ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {translate('Save')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* LOGLINE */}
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileText className="h-5 w-5 mr-2" />
                  {translate('Logline')}
                </h2>
                <Button
                  onClick={generateLoglineApiCall}
                  disabled={generatingLogline || savingLogline || !idea}
                  variant="ai"
                >
                  {generatingLogline ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Logline')}</>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="logline-textarea"
                  initialValue={logline}
                  onValueChange={setLogline}
                  className="min-h-[100px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={translate("Enter your logline here...")}
                  transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                  destinationLanguage={currentProjectLanguage}
                />
                <Button
                  onClick={saveLoglineApiCall}
                  disabled={savingLogline || generatingLogline}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingLogline ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                  ) : (
                     <Save className="h-4 w-4 mr-2" />
                  )}
                   {translate('Save')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* TREATMENT */}
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileEdit className="h-5 w-5 mr-2" />
                  {translate('Treatment')}
                </h2>
                <Button
                  onClick={generateTreatmentApiCall}
                  disabled={generatingTreatment || savingTreatment || !logline}
                  variant="ai"
                >
                  {generatingTreatment ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Treatment')}</>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="treatment-textarea"
                  initialValue={treatment}
                  onValueChange={setTreatment}
                  className="min-h-[200px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={translate("Write your treatment here...")}
                  transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                  destinationLanguage={currentProjectLanguage}
                />
                <Button
                  onClick={saveTreatmentApiCall}
                  disabled={savingTreatment || generatingTreatment}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingTreatment ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                  ) : (
                     <Save className="h-4 w-4 mr-2" />
                  )}
                  {translate('Save')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CHARACTERS */}
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.users className="h-5 w-5 mr-2" />
                  {translate('Characters')}
                </h2>
                <div className="flex space-x-2">
                  <Button
                    onClick={generateCharactersApiCall}
                    disabled={generatingCharacters || !treatment}
                    variant="ai"
                  >
                    {generatingCharacters ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
                    ) : (
                      <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Characters')}</>
                    )}
                  </Button>
                  <Button
                    onClick={addCharacterApiCall}
                    variant="outline"
                    className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                  >
                    <Plus className="h-4 w-4 mr-2" /> {translate('Add Character')}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((character) => (
                  <Card key={character.clientId || character.id} className="bg-white/10 border-white/20">
                    <CardContent className="p-4">
                      <Input 
                        value={character.name || ''}
                        onChange={(e) => handleCharacterChange(character.clientId || character.id, 'name', e.target.value)}
                        className="text-lg font-semibold bg-transparent border-0 p-0 mb-2 text-white"
                        placeholder={translate("Character Name")}
                      />
                      <Textarea
                        value={character.description || ''}
                        onChange={(e) => handleCharacterChange(character.clientId || character.id, 'description', e.target.value)}
                        className="text-sm bg-transparent border-0 p-0 text-gray-300 min-h-[60px]"
                        placeholder={translate("Description")}
                      />
                       {character.hasOwnProperty('backstory') && (
                         <Textarea 
                           value={character.backstory || ''} 
                           onChange={(e) => handleCharacterChange(character.clientId || character.id, 'backstory', e.target.value)}
                           placeholder={translate("Backstory...")}
                           className="text-sm bg-transparent border-0 p-0 mt-2 text-gray-300 min-h-[40px]"
                         />
                       )}
                       {character.hasOwnProperty('motivation') && (
                         <Textarea 
                           value={character.motivation || ''} 
                           onChange={(e) => handleCharacterChange(character.clientId || character.id, 'motivation', e.target.value)}
                           placeholder={translate("Motivation...")}
                           className="text-sm bg-transparent border-0 p-0 mt-2 text-gray-300 min-h-[40px]"
                         />
                       )}
                      <div className="mt-2 flex justify-end space-x-2">
                        {/* Add Save/Delete buttons for characters here */}
                        <Button
                          onClick={() => saveCharacterApiCall(character)}
                          disabled={savingCharacterId === (character.clientId || character.id)}
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          {savingCharacterId === (character.clientId || character.id) ? (
                            <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                          ) : (
                            <><Save className="h-4 w-4 mr-2" />{translate('Save Character')}</>
                          )}
                        </Button>
                        {/* Optionally, add a delete button here later */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SCENES */}
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.film className="h-5 w-5 mr-2" />
                  {translate('Scenes')}
                </h2>
                <div className="flex space-x-2">
                   <Button
                    onClick={generateScenesApiCall}
                    disabled={generatingScenes || characters.length === 0}
                    variant="ai"
                  >
                    {generatingScenes ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
                    ) : (
                      <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Scenes')}</>
                    )}
                  </Button>
                  <Button
                    onClick={addSceneApiCall}
                    variant="outline"
                     className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                  >
                    <Plus className="h-4 w-4 mr-2" /> {translate('Add Scene')}
                  </Button>
                </div>
              </div>
              {scenes.map((scene) => (
                <div key={scene.id} className="mb-4 bg-white/10 p-4 rounded-lg border-white/20">
                  <Input 
                    value={scene.title || ''}
                    onChange={(e) => handleSceneChange(scene.id, 'title', e.target.value)}
                    className="text-lg font-semibold bg-transparent border-0 p-0 mb-2 text-white"
                    placeholder={translate("Scene Title")}
                  />
                  <Textarea
                    value={scene.summary || ''}
                    onChange={(e) => handleSceneChange(scene.id, 'summary', e.target.value)}
                    className="text-sm bg-transparent border-0 p-0 text-gray-300 min-h-[60px]"
                    placeholder={translate("Summary")}
                  />
                  {/* Add Script, Storyboard sections, Generate buttons etc. per scene */}
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={() => saveSceneApiCall(scene)}
                      disabled={savingSceneId === scene.id}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {savingSceneId === scene.id ? (
                        <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" />{translate('Save Scene')}</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}