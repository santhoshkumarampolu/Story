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
import { Save, Share2, Download, Plus, Pencil, Trash2, AlertCircle as IAlertCircle, ClipboardCopy, Tag, Heart, Globe, Camera } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { GoogleTransliterateTextarea } from '@/components/GoogleTransliterateTextarea';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TokenAnimationDisplay } from '@/components/TokenAnimationDisplay';
import { AIOperationProgress } from '@/components/AIOperationProgress';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from "@/lib/utils";
import { getProjectConfiguration, ProjectType } from '@/lib/project-templates';
import { OutlineEditor } from '@/components/story/outline-editor';
import { ChapterManager } from '@/components/story/chapter-manager';
import { NarrativeDraftEditor } from '@/components/story/narrative-draft-editor';

// Define types based on enhanced schema
type CardType = "story" | "scene" | "act" | "dialogue" | "shortfilm" | "advertisement" | "novel" | "synopsis" | "film-story" | "short-story";

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
  fullScript?: string | null; // Added fullScript
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
  const [projectConfig, setProjectConfig] = useState<any>(null);
  const [idea, setIdea] = useState<string>("");
  const [logline, setLogline] = useState<string>("");
  const [treatment, setTreatment] = useState<string>("");
  const [fullScript, setFullScript] = useState<string | null>(null); // New state for full script
  const [outlineBeats, setOutlineBeats] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [narrativeDrafts, setNarrativeDrafts] = useState<any[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [savingScene, setSavingScene] = useState<string | null>(null); // DEPRECATED by savingSceneId, consider removing if not used elsewhere
  const [generatingScript, setGeneratingScript] = useState<string | null>(null); // General script generation, maybe for full project?
  const [generatingStoryboard, setGeneratingStoryboard] = useState<string | null>(null); // General storyboard generation
  const [generatingFullScript, setGeneratingFullScript] = useState<boolean>(false); // New state for full script generation
  const [savingFullScript, setSavingFullScript] = useState<boolean>(false); // New state for saving full script
  const [generatingSceneScript, setGeneratingSceneScript] = useState<string | null>(null); // For specific scene script
  const [generatingSceneStoryboard, setGeneratingSceneStoryboard] = useState<string | null>(null); // For specific scene storyboard
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
  const [savingSceneId, setSavingSceneId] = useState<string | null>(null);
  const [savingCharacterId, setSavingCharacterId] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("idea"); // Default to first workflow step

  // Function to handle character field changes
  const handleCharacterChange = (characterId: string, field: keyof Character, value: string) => {
    setCharacters(prevCharacters =>
      prevCharacters.map(char =>
        (char.id === characterId || char.clientId === characterId) ? { ...char, [field]: value } : char
      )
    );
  };

  // Function to handle scene field changes
  const handleSceneChange = (sceneId: string, field: keyof Scene, value: string | boolean) => {
    setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === sceneId ? { ...scene, [field]: value } : scene
      )
    );
  };

  const toggleSceneSection = (sceneId: string, section: 'isScriptExpanded' | 'isStoryboardExpanded') => {
    setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === sceneId ? { ...scene, [section]: !scene[section] } : scene
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
        
        // Set project configuration based on project type
        const config = getProjectConfiguration(data.type as ProjectType);
        setProjectConfig(config);
        
        // Set active tab to first workflow step
        if (config.workflow && config.workflow.length > 0) {
          setActiveTab(config.workflow[0]);
        }
        
        setIdea(data.idea || "");
        setLogline(data.logline || "");
        setTreatment(data.treatment || "");
        setCharacters(data.characters || []);
        setScenes(data.scenes.map(s => ({ ...s, isSummaryExpanded: false, isStoryboardExpanded: false, isScriptExpanded: false })) || []);
        setCurrentProjectLanguage(data.language || "English");
        setFullScript(data.fullScript || null); // Set full script from fetched data
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

  // Dynamic content renderer based on workflow step
  const renderWorkflowStep = (step: string) => {
    const config = projectConfig;
    const stepLabel = config?.labels?.[step] || step.charAt(0).toUpperCase() + step.slice(1);
    
    switch (step) {
      case 'idea':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.lightbulb className="h-5 w-5 mr-2" />
                  {stepLabel}
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
                  placeholder={translate("Describe your story idea...")}
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
                    <><Icons.save className="h-4 w-4 mr-2" />{translate('Save')}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'logline':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileText className="h-5 w-5 mr-2" />
                  {stepLabel}
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
                    <><Save className="h-4 w-4 mr-2" />{translate('Save')}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'treatment':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileEdit className="h-5 w-5 mr-2" />
                  {stepLabel}
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
                    <><Save className="h-4 w-4 mr-2" />{translate('Save')}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'characters':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.users className="h-5 w-5 mr-2" />
                  {stepLabel}
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'outline':
        return (
          <OutlineEditor
            beats={outlineBeats}
            onBeatsChange={setOutlineBeats}
            onGenerateOutline={() => {
              toast({ title: translate("Outline Generation"), description: translate("Coming soon!") });
            }}
            isGenerating={false}
            isSaving={false}
            onSave={() => {
              toast({ title: translate("Outline Saved"), description: translate("Coming soon!") });
            }}
            transliterationEnabled={isTransliterationEnabled}
            language={currentProjectLanguage}
            translate={translate}
          />
        );
      
      case 'chapters':
        return (
          <ChapterManager
            chapters={chapters}
            onChaptersChange={setChapters}
            onGenerateChapters={() => {
              toast({ title: translate("Chapter Generation"), description: translate("Coming soon!") });
            }}
            isGenerating={false}
            isSaving={false}
            onSave={() => {
              toast({ title: translate("Chapters Saved"), description: translate("Coming soon!") });
            }}
            transliterationEnabled={isTransliterationEnabled}
            language={currentProjectLanguage}
            translate={translate}
          />
        );
      
      case 'narrative-draft':
        return (
          <NarrativeDraftEditor
            drafts={narrativeDrafts}
            onDraftsChange={setNarrativeDrafts}
            onGenerateDraft={() => {
              toast({ title: translate("Draft Generation"), description: translate("Coming soon!") });
            }}
            isGenerating={false}
            isSaving={false}
            onSave={() => {
              toast({ title: translate("Draft Saved"), description: translate("Coming soon!") });
            }}
            transliterationEnabled={isTransliterationEnabled}
            language={currentProjectLanguage}
            translate={translate}
          />
        );
      
      case 'genre':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  {stepLabel}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {translate('Genre')}
                  </label>
                  <select 
                    className="w-full bg-white/10 border border-white/10 text-white rounded-md p-2"
                    onChange={(e) => {
                      toast({ title: translate("Genre Updated"), description: e.target.value });
                    }}
                  >
                    <option value="">{translate('Select Genre')}</option>
                    <option value="literary">Literary Fiction</option>
                    <option value="mystery">Mystery/Thriller</option>
                    <option value="romance">Romance</option>
                    <option value="scifi">Science Fiction</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="horror">Horror</option>
                    <option value="historical">Historical Fiction</option>
                    <option value="contemporary">Contemporary Fiction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {translate('Tone')}
                  </label>
                  <select 
                    className="w-full bg-white/10 border border-white/10 text-white rounded-md p-2"
                    onChange={(e) => {
                      toast({ title: translate("Tone Updated"), description: e.target.value });
                    }}
                  >
                    <option value="">{translate('Select Tone')}</option>
                    <option value="light">Light & Humorous</option>
                    <option value="serious">Serious & Dramatic</option>
                    <option value="dark">Dark & Intense</option>
                    <option value="optimistic">Optimistic & Uplifting</option>
                    <option value="melancholic">Melancholic & Reflective</option>
                    <option value="suspenseful">Suspenseful & Tense</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'theme':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  {stepLabel}
                </h2>
              </div>
              <GoogleTransliterateTextarea
                id="theme-textarea"
                initialValue=""
                onValueChange={(value) => {
                  // TODO: Update project theme
                }}
                className="min-h-[150px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                placeholder={translate("What themes does your story explore? (e.g., love vs duty, the cost of ambition, finding identity)")}
                transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                destinationLanguage={currentProjectLanguage}
              />
            </CardContent>
          </Card>
        );
      
      case 'world-building':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {stepLabel}
                </h2>
              </div>
              <GoogleTransliterateTextarea
                id="worldbuilding-textarea"
                initialValue=""
                onValueChange={(value) => {
                  // TODO: Update project world building
                }}
                className="min-h-[200px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                placeholder={translate("Describe the world, setting, culture, history, and rules that govern your story's universe...")}
                transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                destinationLanguage={currentProjectLanguage}
              />
            </CardContent>
          </Card>
        );
      
      case 'visual-elements':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  {stepLabel}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {translate('Visual Style')}
                  </label>
                  <GoogleTransliterateTextarea
                    id="visual-style-textarea"
                    initialValue=""
                    onValueChange={(value) => {
                      // TODO: Update visual style
                    }}
                    className="min-h-[100px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                    placeholder={translate("Describe the visual aesthetic, color palette, cinematography style...")}
                    transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                    destinationLanguage={currentProjectLanguage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {translate('Key Visual Moments')}
                  </label>
                  <GoogleTransliterateTextarea
                    id="visual-moments-textarea"
                    initialValue=""
                    onValueChange={(value) => {
                      // TODO: Update visual moments
                    }}
                    className="min-h-[100px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                    placeholder={translate("List important visual moments, symbols, or cinematic opportunities...")}
                    transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                    destinationLanguage={currentProjectLanguage}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'scenes':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.film className="h-5 w-5 mr-2" />
                  {stepLabel}
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
                <div key={scene.id} className="mb-6 bg-white/10 p-4 rounded-lg border-white/20 shadow-lg">
                  <Input 
                    value={scene.title || ''}
                    onChange={(e) => handleSceneChange(scene.id, 'title', e.target.value)}
                    className="text-xl font-semibold bg-transparent border-0 p-0 mb-2 text-white focus:ring-0 focus:border-purple-400"
                    placeholder={translate("Scene Title")}
                  />
                  <Textarea
                    value={scene.summary || ''}
                    onChange={(e) => handleSceneChange(scene.id, 'summary', e.target.value)}
                    className="text-sm bg-transparent border-0 p-0 text-gray-300 min-h-[60px] focus:ring-0 focus:border-purple-400"
                    placeholder={translate("Summary")}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      
      case 'script':
      case 'full-script':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileText className="h-5 w-5 mr-2" /> 
                  {stepLabel}
                </h2>
                <Button
                  onClick={generateFullScriptApiCall}
                  disabled={generatingFullScript || savingFullScript || scenes.length === 0} 
                  variant="ai"
                >
                  {generatingFullScript ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating Script...')}</>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Full Script')}</>
                  )}
                </Button>
              </div>
              <GoogleTransliterateTextarea
                id="full-script-textarea"
                initialValue={fullScript || ''}
                onValueChange={(value) => setFullScript(value)}
                className="min-h-[600px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full p-3 rounded-md mb-4"
                placeholder={translate("Generate or paste your full script here...")}
                transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'}
                destinationLanguage={currentProjectLanguage}
                readOnly={generatingFullScript || savingFullScript} 
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={saveFullScriptApiCall}
                  disabled={savingFullScript || generatingFullScript || !fullScript}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {savingFullScript ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />{translate('Save Script')}</>
                  )}
                </Button>
                <Button
                  onClick={copyFullScriptToClipboard}
                  disabled={!fullScript || fullScript.trim() === ""}
                  variant="outline"
                  className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                >
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  {translate('Copy')}
                </Button>
                <Button
                  onClick={downloadFullScript}
                  disabled={!fullScript || fullScript.trim() === ""}
                  variant="outline"
                  className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {translate('Download')}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileText className="h-5 w-5 mr-2" />
                  {stepLabel}
                </h2>
              </div>
              <div className="text-gray-400 text-center py-8">
                <p>This workflow step is not yet implemented.</p>
                <p className="text-sm mt-2">Coming soon: {stepLabel} editor</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };
  const handleLanguageChange = async (newLanguage: string) => { 
    setCurrentProjectLanguage(newLanguage);
    setProject(prev => prev ? {...prev, language: newLanguage} : null);
    // TODO: Consider saving this change to the backend immediately or as part of a general save
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

  const generateSceneScriptApiCall = async (sceneId: string) => {
    const sceneToGenerate = scenes.find(s => s.id === sceneId);
    if (!sceneToGenerate) {
      toast({ title: translate("Error"), description: translate("Scene not found."), variant: "destructive" });
      return;
    }

    setGeneratingSceneScript(sceneId);
    try {
      const response = await fetch(`/api/projects/${projectId}/scenes/${sceneId}/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneSummary: sceneToGenerate.summary,
          sceneTitle: sceneToGenerate.title,
          projectLanguage: currentProjectLanguage,
          logline: project?.logline, // Pass project logline for context
          treatment: project?.treatment, // Pass project treatment for context
          characters: characters.map(c => ({ name: c.name, description: c.description })), // Pass all characters for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate scene script');
      }

      const data = await response.json(); // Expect { script: string, tokensUsed: number, cost: number }

      setScenes(prevScenes =>
        prevScenes.map(s =>
          s.id === sceneId ? { ...s, script: data.script, version: (s.version || 0) + 1 } : s
        )
      );

      if (data.tokensUsed && data.cost) {
        setTokenUpdates(prev => [...prev, {
          id: `script-${sceneId}-${Date.now()}`,
          tokens: data.tokensUsed,
          cost: data.cost,
          timestamp: Date.now(),
          type: "script",
          operation: `Scene Script: ${sceneToGenerate.title}`
        }]);
         updateTokenUsage("script", `Scene Script: ${sceneToGenerate.title}`);
      }
      
      toast({ title: translate("Success"), description: translate(`Script generated for scene "${sceneToGenerate.title}"`) });
    } catch (error: any) {
      console.error(`Error generating script for scene ${sceneId}:`, error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to generate scene script."),
        variant: "destructive",
      });
    } finally {
      setGeneratingSceneScript(null);
    }
  };

  const generateSceneStoryboardApiCall = async (sceneId: string) => {
    const sceneToGenerate = scenes.find(s => s.id === sceneId);
    if (!sceneToGenerate) {
      toast({ title: translate("Error"), description: translate("Scene not found."), variant: "destructive" });
      return;
    }

    setGeneratingSceneStoryboard(sceneId);
    try {
      const response = await fetch(`/api/projects/${projectId}/scenes/${sceneId}/generate-storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneTitle: sceneToGenerate.title,
          sceneSummary: sceneToGenerate.summary,
          sceneScript: sceneToGenerate.script, // Pass the current script as context
          projectLanguage: currentProjectLanguage,
          logline: project?.logline,
          treatment: project?.treatment,
          characters: characters.map(c => ({ name: c.name, description: c.description })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate scene storyboard');
      }

      const data = await response.json(); // Expect { storyboard: string, tokensUsed: number, cost: number }

      setScenes(prevScenes =>
        prevScenes.map(s =>
          s.id === sceneId ? { ...s, storyboard: data.storyboard, version: (s.version || 0) + 1 } : s
        )
      );

      if (data.tokensUsed && data.cost) {
        setTokenUpdates(prev => [...prev, {
          id: `storyboard-${sceneId}-${Date.now()}`,
          tokens: data.tokensUsed,
          cost: data.cost,
          timestamp: Date.now(),
          type: "storyboard", // Ensure this type is valid
          operation: `Scene Storyboard: ${sceneToGenerate.title}`
        }]);
        updateTokenUsage("storyboard", `Scene Storyboard: ${sceneToGenerate.title}`);
      }

      toast({ title: translate("Success"), description: translate(`Storyboard generated for scene "${sceneToGenerate.title}"`) });
    } catch (error: any) {
      console.error(`Error generating storyboard for scene ${sceneId}:`, error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to generate scene storyboard."),
        variant: "destructive",
      });
    } finally {
      setGeneratingSceneStoryboard(null);
    }
  };

  const generateFullScriptApiCall = async () => {
    if (!project) return;
    setGeneratingFullScript(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-full-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No body needed as backend fetches all required data based on projectId
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate full script');
      }

      const data = await response.json(); // Expect { fullScript: string, tokensUsed: number, cost: number }

      setFullScript(data.fullScript);
      setProject(prev => prev ? { ...prev, fullScript: data.fullScript } : null);

      if (data.tokensUsed && data.cost && project) { // Added project check for title
        setTokenUpdates(prev => [...prev, {
          id: `full-script-${projectId}-${Date.now()}`,
          tokens: data.tokensUsed,
          cost: data.cost,
          timestamp: Date.now(),
          type: "script", // Or a new type like "full_script"
          operation: `Full Script: ${project.title}`
        }]);
        updateTokenUsage("script", `Full Script: ${project.title}`);
      }

      toast({ title: translate("Success"), description: translate("Full script generated successfully!") });
      setActiveTab("full-script"); // Switch to the full script tab
    } catch (error: any) {
      console.error("Error generating full script:", error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to generate full script."),
        variant: "destructive",
      });
    } finally {
      setGeneratingFullScript(false);
    }
  };

  const saveFullScriptApiCall = async () => {
    if (!project || fullScript === null) {
      toast({
        title: translate("Nothing to save"),
        description: translate("Full script is empty or project not loaded."),
        variant: "destructive",
      });
      return;
    }
    setSavingFullScript(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullScript: fullScript }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save full script');
      }
      const updatedProject = await response.json();
      // Assuming the PATCH endpoint returns the updated project or at least the updated field
      setProject(prev => prev ? { ...prev, fullScript: updatedProject.fullScript !== undefined ? updatedProject.fullScript : fullScript } : null);
      if (updatedProject.fullScript !== undefined) {
        setFullScript(updatedProject.fullScript);
      }
      
      toast({ title: translate("Success"), description: translate("Full script saved successfully!") });
    } catch (error: any) {
      console.error("Error saving full script:", error);
      toast({
        title: translate("Error"),
        description: error.message || translate("Failed to save full script."),
        variant: "destructive",
      });
    } finally {
      setSavingFullScript(false);
    }
  };

  const copyFullScriptToClipboard = () => {
    if (fullScript && fullScript.trim() !== "") {
      navigator.clipboard.writeText(fullScript)
        .then(() => {
          toast({ title: translate("Copied!"), description: translate("Full script copied to clipboard.") });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({ title: translate("Error"), description: translate("Failed to copy script."), variant: "destructive" });
        });
    } else {
      toast({ title: translate("Nothing to copy"), description: translate("Full script is empty."), variant: "default" });
    }
  };

  const downloadFullScript = () => {
    if (fullScript && fullScript.trim() !== "" && project) {
      const blob = new Blob([fullScript], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = project.title ? project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'script';
      link.download = `${fileName}_full_script.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: translate("Downloaded"), description: translate("Full script download started.") });
    } else {
      toast({ title: translate("Nothing to download"), description: translate("Full script is empty."), variant: "default" });
    }
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
          isGenerating={!!generatingScript || !!generatingStoryboard || generatingTreatment || generatingIdea || generatingLogline || generatingCharacters || generatingScenes || !!generatingSceneScript || !!generatingSceneStoryboard || generatingFullScript || savingFullScript}
          operationType={
            generatingScript ? "script" : 
            generatingStoryboard ? "storyboard" : 
            generatingSceneScript ? "script" : 
            generatingSceneStoryboard ? "storyboard" : 
            generatingFullScript ? "script" : 
            savingFullScript ? "save" : // Added saving full script
            generatingTreatment ? "treatment" : 
            generatingIdea ? "idea" : 
            generatingLogline ? "logline" :
            generatingCharacters ? "character_generation" :
            generatingScenes ? "scenes" :
            "script" // Default
          }
          operationName={
            generatingScript ? translate("Full Script Generation") : 
            generatingStoryboard ? translate("Full Storyboard Generation") :
            generatingSceneScript ? translate("Scene Script Generation") : 
            generatingSceneStoryboard ? translate("Scene Storyboard Generation") : 
            generatingFullScript ? translate("Full Script Generation") : 
            savingFullScript ? translate("Saving Full Script") : // Added saving full script
            generatingTreatment ? translate("Treatment Generation") :
            generatingIdea ? translate("Idea Generation") : 
            generatingLogline ? translate("Logline Generation") :
            generatingCharacters ? translate("Character Generation") :
            generatingScenes ? translate("Scene Generation") :
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

        {/* Main Content Area with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-white/5 backdrop-blur-md border border-white/10" style={{ gridTemplateColumns: `repeat(${projectConfig?.workflow?.length || 4}, 1fr)` }}>
            {projectConfig?.workflow?.map((step: string) => (
              <TabsTrigger 
                key={step} 
                value={step} 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                {projectConfig.labels?.[step] || step.charAt(0).toUpperCase() + step.slice(1)}
              </TabsTrigger>
            )) || (
              <>
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">{translate('Overview')}</TabsTrigger>
                <TabsTrigger value="characters" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">{translate('Characters')}</TabsTrigger>
                <TabsTrigger value="scenes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">{translate('Scenes')}</TabsTrigger>
                <TabsTrigger value="full-script" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">{translate('Full Script')}</TabsTrigger>
              </>
            )}
          </TabsList>

          {projectConfig?.workflow?.map((step: string) => (
            <TabsContent key={step} value={step} className="space-y-8">
              {renderWorkflowStep(step)}
            </TabsContent>
          )) || (
            <>
              <TabsContent value="overview" className="space-y-8">
                {renderWorkflowStep('idea')}
                {renderWorkflowStep('logline')}
                {renderWorkflowStep('treatment')}
              </TabsContent>
              <TabsContent value="characters" className="space-y-8">
                {renderWorkflowStep('characters')}
              </TabsContent>
              <TabsContent value="scenes" className="space-y-8">
                {renderWorkflowStep('scenes')}
              </TabsContent>
              <TabsContent value="full-script" className="space-y-8">
                {renderWorkflowStep('full-script')}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </ScrollArea>
  );
}