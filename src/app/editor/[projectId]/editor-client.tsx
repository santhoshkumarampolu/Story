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
import { useTranslations, T } from '@/components/TranslationProvider';
import { cn } from "@/lib/utils";
import { getProjectConfiguration, ProjectType } from '@/lib/project-templates';
import { OutlineEditor } from '@/components/story/outline-editor';
import { ChapterManager } from '@/components/story/chapter-manager';
import { NarrativeDraftEditor } from '@/components/story/narrative-draft-editor';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  blurb: string | null; // For synopsis
  plotPoints?: string | null; // For plot points
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
  type: "script" | "storyboard" | "treatment" | "idea" | "logline" | "character_generation" | "scenes" | "synopsis";
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

interface EditorPageClientProps {
  projectId: string;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function EditorPageClient({ 
  projectId, 
  currentLanguage, 
  onLanguageChange 
}: EditorPageClientProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectConfig, setProjectConfig] = useState<any>(null);
  const [idea, setIdea] = useState<string>("");
  const [logline, setLogline] = useState<string>("");
  const [treatment, setTreatment] = useState<string>("");
  const [synopsis, setSynopsis] = useState<string>("");
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
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const [generatingLogline, setGeneratingLogline] = useState(false);
  const [savingLogline, setSavingLogline] = useState(false);
  const [generatingTreatment, setGeneratingTreatment] = useState(false);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [generatingSynopsis, setGeneratingSynopsis] = useState(false);
  const [savingSynopsis, setSavingSynopsis] = useState(false);
  const [generatingCharacters, setGeneratingCharacters] = useState(false);
  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [savingSceneId, setSavingSceneId] = useState<string | null>(null);
  const [savingCharacterId, setSavingCharacterId] = useState<string | null>(null);
  const [deletingCharacterId, setDeletingCharacterId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("idea"); // Default to first workflow step
  const { t } = useTranslations();
  const [cinematicTheme, setCinematicTheme] = useState<string>("");
  const [generatingTheme, setGeneratingTheme] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [visualStyle, setVisualStyle] = useState<string>("");
  const [keyVisualMoments, setKeyVisualMoments] = useState<string>("");
  const [generatingVisualElements, setGeneratingVisualElements] = useState(false);
  const [savingVisualElements, setSavingVisualElements] = useState(false);
  const [plotPoints, setPlotPoints] = useState<string>("");
  const [generatingPlotPoints, setGeneratingPlotPoints] = useState(false);
  const [savingPlotPoints, setSavingPlotPoints] = useState(false);

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const ideaGeneratorRef = useRef<IdeaGeneratorHandle>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        // Fetch project data
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project');
        }
        const projectData = await projectResponse.json();
        setProject(projectData);
        
        // Fetch token usage data
        try {
          const usageResponse = await fetch(`/api/projects/${projectId}/usage`);
          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            setTokenUsage(usageData);
          }
        } catch (error) {
          console.error('Failed to fetch token usage:', error);
        }
        
        // Set project configuration based on project type
        const config = getProjectConfiguration(projectData.type as ProjectType);
        setProjectConfig(config);
        
        // Set active tab to first workflow step
        if (config.workflow && config.workflow.length > 0) {
          setActiveTab(config.workflow[0]);
        }
        
        setIdea(projectData.idea || "");
        setLogline(projectData.logline || "");
        setTreatment(projectData.treatment || "");
        setSynopsis(projectData.blurb || "");
        setPlotPoints(projectData.plotPoints || "");
        setCharacters(projectData.characters || []);
        setScenes(projectData.scenes.map((s: Scene) => ({ ...s, isSummaryExpanded: false, isStoryboardExpanded: false, isScriptExpanded: false })) || []);
        setFullScript(projectData.fullScript || null); // Set full script from fetched data
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: t("messages.error", { ns: "editor", defaultValue: "Error" }),
          description: t("messages.failedToLoadProject", { ns: "editor", defaultValue: "Failed to load project" }),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, toast, t, router, status]);

  const updateTokenUsage = async (operationType?: string, operationName?: string) => {
    try {
      // Fetch current token usage for this project
      const response = await fetch(`/api/projects/${projectId}/usage`);
      if (response.ok) {
        const data = await response.json();
        setTokenUsage(data);
      }
    } catch (error) {
      console.error('Failed to update token usage:', error);
    }
  };

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
                  <T k="labels.idea" ns="editor" defaultValue="Idea" />
                </h2>
                <Button
                  onClick={generateIdeaApiCall}
                  disabled={generatingIdea || savingIdea}
                  variant="ai"
                >
                  {generatingIdea ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.generating" ns="editor" defaultValue="Generating..." /></>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" /><T k="actions.generateIdea" ns="editor" defaultValue="Generate Idea" /></>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="idea-textarea"
                  initialValue={idea}
                  onValueChange={setIdea}
                  className="min-h-[150px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={t('placeholders.enterIdea', { ns: 'editor', defaultValue: 'Describe your story idea...' })}
                  transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                  destinationLanguage={currentLanguage}
                />
                <Button
                  onClick={saveIdeaApiCall}
                  disabled={savingIdea || generatingIdea}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingIdea ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.saving" ns="editor" defaultValue="Saving..." /></>
                  ) : (
                    <><Icons.save className="h-4 w-4 mr-2" /><T k="toolbar.save" ns="editor" defaultValue="Save" /></>
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
                  <T k="labels.logline" ns="editor" defaultValue="Logline" />
                </h2>
                <Button
                  onClick={generateLoglineApiCall}
                  disabled={generatingLogline || savingLogline || !idea}
                  variant="ai"
                >
                  {generatingLogline ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.generating" ns="editor" defaultValue="Generating..." /></>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" /><T k="actions.generateLogline" ns="editor" defaultValue="Generate Logline" /></>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="logline-textarea"
                  initialValue={logline}
                  onValueChange={setLogline}
                  className="min-h-[100px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={t('placeholders.enterLogline', { ns: 'editor', defaultValue: 'Enter your logline here...' })}
                  transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                  destinationLanguage={currentLanguage}
                />
                <Button
                  onClick={saveLoglineApiCall}
                  disabled={savingLogline || generatingLogline}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingLogline ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.saving" ns="editor" defaultValue="Saving..." /></>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /><T k="toolbar.save" ns="editor" defaultValue="Save" /></>
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
                  <T k="labels.treatment" ns="editor" defaultValue="Treatment" />
                </h2>
                <Button
                  onClick={generateTreatmentApiCall}
                  disabled={generatingTreatment || savingTreatment || !logline}
                  variant="ai"
                >
                  {generatingTreatment ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.generating" ns="editor" defaultValue="Generating..." /></>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" /><T k="actions.generateTreatment" ns="editor" defaultValue="Generate Treatment" /></>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="treatment-textarea"
                  initialValue={treatment}
                  onValueChange={setTreatment}
                  className="min-h-[200px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={t('placeholders.enterTreatment', { ns: 'editor', defaultValue: 'Write a detailed treatment of your story...' })}
                  transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                  destinationLanguage={currentLanguage}
                />
                <Button
                  onClick={saveTreatmentApiCall}
                  disabled={savingTreatment || generatingTreatment}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingTreatment ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.saving" ns="editor" defaultValue="Saving..." /></>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /><T k="toolbar.save" ns="editor" defaultValue="Save" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'summary':
      case 'synopsis':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileText className="h-5 w-5 mr-2" />
                  <T k="labels.synopsis" ns="editor" defaultValue="Synopsis" />
                </h2>
                <Button
                  onClick={generateSynopsisApiCall}
                  disabled={generatingSynopsis || savingSynopsis || !logline}
                  variant="ai"
                >
                  {generatingSynopsis ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.generating" ns="editor" defaultValue="Generating..." /></>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" /><T k="actions.generateSynopsis" ns="editor" defaultValue="Generate Synopsis" /></>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="synopsis-textarea"
                  initialValue={synopsis}
                  onValueChange={setSynopsis}
                  className="min-h-[300px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={t('placeholders.enterSynopsis', { ns: 'editor', defaultValue: 'Write a compelling synopsis of your story...' })}
                  transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                  destinationLanguage={currentLanguage}
                />
                <Button
                  onClick={saveSynopsisApiCall}
                  disabled={savingSynopsis || generatingSynopsis}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingSynopsis ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.saving" ns="editor" defaultValue="Saving..." /></>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /><T k="toolbar.save" ns="editor" defaultValue="Save" /></>
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
                  <T k="labels.characters" ns="editor" defaultValue="Characters" />
                </h2>
                <div className="flex space-x-2">
                  <Button
                    onClick={generateCharactersApiCall}
                    disabled={generatingCharacters || (!idea || !logline || !synopsis)}
                    variant="ai"
                  >
                    {generatingCharacters ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('Generating...')}</>
                    ) : (
                      <><Icons.sparkles className="h-4 w-4 mr-2" />{t('Generate Characters')}</>
                    )}
                  </Button>
                  <Button
                    onClick={addCharacterApiCall}
                    variant="outline"
                    className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                  >
                    <Plus className="h-4 w-4 mr-2" /> {t('Add Character')}
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
                        placeholder={t('placeholders.characterName', { ns: 'editor', defaultValue: 'Character Name' })}
                      />
                      <Textarea
                        value={character.description || ''}
                        onChange={(e) => handleCharacterChange(character.clientId || character.id, 'description', e.target.value)}
                        className="text-sm bg-transparent border-0 p-0 text-gray-300 min-h-[60px]"
                        placeholder={t('placeholders.description', { ns: 'editor', defaultValue: 'Description' })}
                      />
                      {character.hasOwnProperty('backstory') && (
                        <Textarea 
                          value={character.backstory || ''} 
                          onChange={(e) => handleCharacterChange(character.clientId || character.id, 'backstory', e.target.value)}
                          placeholder={t('placeholders.backstory', { ns: 'editor', defaultValue: 'Backstory...' })}
                          className="text-sm bg-transparent border-0 p-0 mt-2 text-gray-300 min-h-[40px]"
                        />
                      )}
                      {character.hasOwnProperty('motivation') && (
                        <Textarea 
                          value={character.motivation || ''} 
                          onChange={(e) => handleCharacterChange(character.clientId || character.id, 'motivation', e.target.value)}
                          placeholder={t('placeholders.motivation', { ns: 'editor', defaultValue: 'Motivation...' })}
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
                            <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('Saving...')}</>
                          ) : (
                            <><Save className="h-4 w-4 mr-2" />{t('Save Character')}</>
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteCharacterApiCall(character)}
                          disabled={deletingCharacterId === (character.clientId || character.id)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          {deletingCharacterId === (character.clientId || character.id) ? (
                            <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('Deleting...')}</>
                          ) : (
                            <><Icons.trash className="h-4 w-4 mr-2" />{t('Delete')}</>
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
      
      case 'plot-points':
        return (
          <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Icons.fileText className="h-5 w-5 mr-2" />
                  <T k="labels.plotPoints" ns="editor" defaultValue="Plot Points" />
                </h2>
                <Button
                  onClick={generatePlotPointsApiCall}
                  disabled={generatingPlotPoints || savingPlotPoints || (!treatment && !logline)}
                  variant="ai"
                >
                  {generatingPlotPoints ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.generating" ns="editor" defaultValue="Generating..." /></>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" /><T k="actions.generatePlotPoints" ns="editor" defaultValue="Generate Plot Points" /></>
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <GoogleTransliterateTextarea
                  id="plot-points-textarea"
                  initialValue={plotPoints}
                  onValueChange={setPlotPoints}
                  className="min-h-[300px] pr-20 bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                  placeholder={t('placeholders.enterPlotPoints', { ns: 'editor', defaultValue: 'Key plot points and story structure...' })}
                  transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                  destinationLanguage={currentLanguage}
                />
                <Button
                  onClick={savePlotPointsApiCall}
                  disabled={savingPlotPoints || generatingPlotPoints}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingPlotPoints ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" /><T k="status.saving" ns="editor" defaultValue="Saving..." /></>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /><T k="toolbar.save" ns="editor" defaultValue="Save" /></>
                  )}
                </Button>
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
              toast({ title: t('messages.outlineGeneration', { ns: 'editor', defaultValue: 'Outline Generation' }), description: t('messages.comingSoon', { ns: 'editor', defaultValue: 'Coming soon!' }) });
            }}
            isGenerating={false}
            isSaving={false}
            onSave={() => {
              toast({ title: t('messages.outlineSaved', { ns: 'editor', defaultValue: 'Outline Saved' }), description: t('messages.comingSoon', { ns: 'editor', defaultValue: 'Coming soon!' }) });
            }}
            transliterationEnabled={isTransliterationEnabled}
            language={currentLanguage}
            translate={t}
          />
        );
      
      case 'chapters':
        return (
          <ChapterManager
            chapters={chapters}
            onChaptersChange={setChapters}
            onGenerateChapters={() => {
              toast({ title: t('messages.chapterGeneration', { ns: 'editor', defaultValue: 'Chapter Generation' }), description: t('messages.comingSoon', { ns: 'editor', defaultValue: 'Coming soon!' }) });
            }}
            isGenerating={false}
            isSaving={false}
            onSave={() => {
              toast({ title: t('messages.chaptersSaved', { ns: 'editor', defaultValue: 'Chapters Saved' }), description: t('messages.comingSoon', { ns: 'editor', defaultValue: 'Coming soon!' }) });
            }}
            transliterationEnabled={isTransliterationEnabled}
            language={currentLanguage}
            translate={t}
          />
        );
      
      case 'narrative-draft':
        return (
          <NarrativeDraftEditor
            drafts={narrativeDrafts}
            onDraftsChange={setNarrativeDrafts}
            onGenerateDraft={() => {
              toast({ title: t('messages.draftGeneration', { ns: 'editor', defaultValue: 'Draft Generation' }), description: t('messages.comingSoon', { ns: 'editor', defaultValue: 'Coming soon!' }) });
            }}
            isGenerating={false}
            isSaving={false}
            onSave={() => {
              toast({ title: t('messages.draftSaved', { ns: 'editor', defaultValue: 'Draft Saved' }), description: t('messages.comingSoon', { ns: 'editor', defaultValue: 'Coming soon!' }) });
            }}
            transliterationEnabled={isTransliterationEnabled}
            language={currentLanguage}
            translate={t}
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
                    {t('Genre')}
                  </label>
                  <select 
                    className="w-full bg-white/10 border border-white/10 text-white rounded-md p-2"
                    onChange={(e) => {
                      toast({ title: t('messages.genreUpdated', { ns: 'editor', defaultValue: 'Genre Updated' }), description: e.target.value });
                    }}
                  >
                    <option value="">{t('Select Genre')}</option>
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
                    {t('Tone')}
                  </label>
                  <select 
                    className="w-full bg-white/10 border border-white/10 text-white rounded-md p-2"
                    onChange={(e) => {
                      toast({ title: t('messages.toneUpdated', { ns: 'editor', defaultValue: 'Tone Updated' }), description: e.target.value });
                    }}
                  >
                    <option value="">{t('Select Tone')}</option>
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
                  <T k="labels.theme" ns="editor" defaultValue="Cinematic Theme" />
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={generateThemeApiCall}
                    disabled={generatingTheme}
                    variant="ai"
                  >
                    {generatingTheme ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('status.generating', { ns: 'editor', defaultValue: 'Generating...' })}</>
                    ) : (
                      <><Icons.sparkles className="h-4 w-4 mr-2" />{t('Generate Cinematic Themes', { ns: 'editor', defaultValue: 'Generate Cinematic Themes' })}</>
                    )}
                  </Button>
                  <Button
                    onClick={saveThemeApiCall}
                    disabled={savingTheme || generatingTheme}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {savingTheme ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('status.saving', { ns: 'editor', defaultValue: 'Saving...' })}</>
                    ) : (
                      <><Icons.save className="h-4 w-4 mr-2" />{t('toolbar.save', { ns: 'editor', defaultValue: 'Save' })}</>
                    )}
                  </Button>
                </div>
              </div>
              <GoogleTransliterateTextarea
                id="theme-textarea"
                initialValue={cinematicTheme}
                onValueChange={setCinematicTheme}
                className="min-h-[150px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                placeholder={t('placeholders.themeExploration', { ns: 'editor', defaultValue: 'What themes does your story explore? (e.g., love vs duty, the cost of ambition, finding identity)' })}
                transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                destinationLanguage={currentLanguage}
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
                placeholder={t('placeholders.worldDescription', { ns: 'editor', defaultValue: 'Describe the world, setting, culture, history, and rules that govern your story universe...' })}
                transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                destinationLanguage={currentLanguage}
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
                <div className="flex gap-2">
                  <Button
                    onClick={generateVisualElementsApiCall}
                    disabled={generatingVisualElements}
                    variant="ai"
                  >
                    {generatingVisualElements ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('status.generating', { ns: 'editor', defaultValue: 'Generating...' })}</>
                    ) : (
                      <><Icons.sparkles className="h-4 w-4 mr-2" />{t('Generate Visual Elements', { ns: 'editor', defaultValue: 'Generate Visual Elements' })}</>
                    )}
                  </Button>
                  <Button
                    onClick={saveVisualElementsApiCall}
                    disabled={savingVisualElements || generatingVisualElements}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {savingVisualElements ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('status.saving', { ns: 'editor', defaultValue: 'Saving...' })}</>
                    ) : (
                      <><Icons.save className="h-4 w-4 mr-2" />{t('toolbar.save', { ns: 'editor', defaultValue: 'Save' })}</>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('Visual Style')}
                  </label>
                  <GoogleTransliterateTextarea
                    id="visual-style-textarea"
                    initialValue={visualStyle}
                    onValueChange={setVisualStyle}
                    className="min-h-[100px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                    placeholder={t('placeholders.visualAesthetic', { ns: 'editor', defaultValue: 'Describe the visual aesthetic, color palette, cinematography style...' })}
                    transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                    destinationLanguage={currentLanguage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('Key Visual Moments')}
                  </label>
                  <GoogleTransliterateTextarea
                    id="visual-moments-textarea"
                    initialValue={keyVisualMoments}
                    onValueChange={setKeyVisualMoments}
                    className="min-h-[100px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full"
                    placeholder={t('placeholders.visualMoments', { ns: 'editor', defaultValue: 'List important visual moments, symbols, or cinematic opportunities...' })}
                    transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                    destinationLanguage={currentLanguage}
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
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('Generating...')}</>
                    ) : (
                      <><Icons.sparkles className="h-4 w-4 mr-2" />{t('Generate Scenes')}</>
                    )}
                  </Button>
                  <Button
                    onClick={addSceneApiCall}
                    variant="outline"
                    className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                  >
                    <Plus className="h-4 w-4 mr-2" /> {t('Add Scene')}
                  </Button>
                </div>
              </div>
              {scenes.map((scene) => (
                <div key={scene.id} className="mb-6 bg-white/10 p-4 rounded-lg border-white/20 shadow-lg">
                  <Input 
                    value={scene.title || ''}
                    onChange={(e) => handleSceneChange(scene.id, 'title', e.target.value)}
                    className="text-xl font-semibold bg-transparent border-0 p-0 mb-2 text-white focus:ring-0 focus:border-purple-400"
                    placeholder={t("Scene Title")}
                  />
                  <Textarea
                    value={scene.summary || ''}
                    onChange={(e) => handleSceneChange(scene.id, 'summary', e.target.value)}
                    className="text-sm bg-transparent border-0 p-0 text-gray-300 min-h-[60px] focus:ring-0 focus:border-purple-400"
                    placeholder={t("Summary")}
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
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('status.generating', { ns: 'editor', defaultValue: 'Generating...' })}</>
                  ) : (
                    <><Icons.sparkles className="h-4 w-4 mr-2" />{t('actions.generateFullScript', { ns: 'editor', defaultValue: 'Generate Full Script' })}</>
                  )}
                </Button>
              </div>
              <GoogleTransliterateTextarea
                id="full-script-textarea"
                initialValue={fullScript || ''}
                onValueChange={(value) => setFullScript(value)}
                className="min-h-[600px] bg-white/10 text-white placeholder:text-gray-400 border-white/10 w-full p-3 rounded-md mb-4"
                placeholder={t("Generate or paste your full script here...")}
                transliterationEnabled={isTransliterationEnabled && currentLanguage !== 'English'}
                destinationLanguage={currentLanguage}
                readOnly={generatingFullScript || savingFullScript} 
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={saveFullScriptApiCall}
                  disabled={savingFullScript || generatingFullScript || !fullScript}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {savingFullScript ? (
                    <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('Saving...')}</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />{t('Save Script')}</>
                  )}
                </Button>
                <Button
                  onClick={copyFullScriptToClipboard}
                  disabled={!fullScript || fullScript.trim() === ""}
                  variant="outline"
                  className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                >
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  {t('Copy')}
                </Button>
                <Button
                  onClick={downloadFullScript}
                  disabled={!fullScript || fullScript.trim() === ""}
                  variant="outline"
                  className="text-purple-300 border-purple-300 hover:bg-purple-300/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('Download')}
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
    try {
      // Update local state immediately for better UX
      onLanguageChange(newLanguage);
      setProject(prev => prev ? {...prev, language: newLanguage} : null);
      
      // Save the language change to the backend
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLanguage }),
      });

      if (!response.ok) {
        throw new Error('Failed to save language change');
      }

      toast({ 
        title: t('notifications.languageUpdated', { ns: 'editor', defaultValue: 'Language Updated' }), 
        description: t('notifications.languageChanged', { ns: 'editor', defaultValue: 'Language changed to {{language}}', interpolation: { language: newLanguage } })
      });
    } catch (error: any) {
      console.error('Error updating language:', error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: t('notifications.failedToUpdateLanguage', { ns: 'editor', defaultValue: 'Failed to update language.' }),
        variant: 'destructive',
      });
    }
  };
  
  const generateIdeaApiCall = async () => { 
    setGeneratingIdea(true); 
    console.log("Generating idea..."); 
    
    try {
      const response = await fetch(`/api/projects/${projectId}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea || '', // Send user's typed idea if available
          generateRandom: !idea || idea.trim() === '', // Generate random if no idea provided
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ideas');
      }

      const data = await response.json();
      
      if (data.generatedIdeas && data.generatedIdeas.length > 0) {
        // Display the generated ideas to the user
        // For now, we'll show the first idea in the textarea
        // In the future, you might want to show a modal with all 3 ideas for selection
        const firstIdea = data.generatedIdeas[0];
        const ideaText = `${firstIdea.Concept}\n\nConflict: ${firstIdea.Conflict}\nEmotional Hook: ${firstIdea.EmotionalHook}\nVisual Style: ${firstIdea.VisualStyle}\nUnique Element: ${firstIdea.UniqueElement}`;
        
        setIdea(ideaText);
        
        toast({
          title: t('notifications.ideasGenerated', { ns: 'editor', defaultValue: 'Ideas Generated' }),
          description: t('notifications.ideasGeneratedSuccess', { ns: 'editor', defaultValue: 'Generated {{count}} ideas based on your input', interpolation: { count: data.generatedIdeas.length } })
        });
        
        updateTokenUsage("idea", "Generate Ideas");
      } else {
        throw new Error('No ideas were generated');
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToGenerateIdeas', { ns: 'editor', defaultValue: 'Failed to generate ideas.' }),
        variant: "destructive",
      });
    } finally {
      setGeneratingIdea(false);
    }
  };
  const saveIdeaApiCall = async () => { 
    setSavingIdea(true); 
    console.log("Saving idea...", idea); 
    
    try {
      const response = await fetch(`/api/projects/${projectId}/ideas`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: idea || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save idea');
      }

      const data = await response.json();
      
      // Update the project state with the saved idea
      setProject(prev => prev ? { ...prev, idea: data.idea } : null);
      
      toast({
        title: t('notifications.ideaSaved', { ns: 'editor', defaultValue: 'Idea Saved' }),
        description: t('notifications.ideaSavedSuccess', { ns: 'editor', defaultValue: 'Your idea has been saved successfully.' })
      });
    } catch (error: any) {
      console.error("Error saving idea:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToSaveIdea', { ns: 'editor', defaultValue: 'Failed to save idea.' }),
        variant: "destructive",
      });
    } finally {
      setSavingIdea(false);
    }
  };
  const generateLoglineApiCall = async () => {
    setGeneratingLogline(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-logline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea, // Use the current idea from state
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate logline');
      }

      const data = await response.json();
      setLogline(data.logline || "");
      
      toast({
        title: t('notifications.loglineGenerated', { ns: 'editor', defaultValue: 'Logline Generated' }),
        description: t('notifications.loglineGeneratedSuccess', { ns: 'editor', defaultValue: 'Your logline has been generated successfully.' })
      });
      
      updateTokenUsage("logline", "Generate Logline");
    } catch (error: any) {
      console.error("Error generating logline:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToGenerateLogline', { ns: 'editor', defaultValue: 'Failed to generate logline.' }),
        variant: "destructive",
      });
    } finally {
      setGeneratingLogline(false);
    }
  };
  const saveLoglineApiCall = async () => {
    setSavingLogline(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/logline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: logline,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save logline');
      }

      const data = await response.json();
      setProject(prev => prev ? { ...prev, logline: data.logline } : null);
      
      toast({
        title: t('notifications.loglineSaved', { ns: 'editor', defaultValue: 'Logline Saved' }),
        description: t('notifications.loglineSavedSuccess', { ns: 'editor', defaultValue: 'Your logline has been saved successfully.' })
      });
    } catch (error: any) {
      console.error("Error saving logline:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToSaveLogline', { ns: 'editor', defaultValue: 'Failed to save logline.' }),
        variant: "destructive",
      });
    } finally {
      setSavingLogline(false);
    }
  };
  const generateTreatmentApiCall = async () => {
    setGeneratingTreatment(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/treatment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea,
          logline: logline,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate treatment');
      }

      const data = await response.json();
      setTreatment(data.treatment || "");
      
      toast({
        title: t('notifications.treatmentGenerated', { ns: 'editor', defaultValue: 'Treatment Generated' }),
        description: t('notifications.treatmentGeneratedSuccess', { ns: 'editor', defaultValue: 'Your treatment has been generated successfully.' })
      });
      
      updateTokenUsage("treatment", "Generate Treatment");
    } catch (error: any) {
      console.error("Error generating treatment:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToGenerateTreatment', { ns: 'editor', defaultValue: 'Failed to generate treatment.' }),
        variant: "destructive",
      });
    } finally {
      setGeneratingTreatment(false);
    }
  };
  const saveTreatmentApiCall = async () => {
    setSavingTreatment(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/treatment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: treatment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save treatment');
      }

      const data = await response.json();
      setProject(prev => prev ? { ...prev, treatment: data.treatment } : null);
      
      toast({
        title: t('notifications.treatmentSaved', { ns: 'editor', defaultValue: 'Treatment Saved' }),
        description: t('notifications.treatmentSavedSuccess', { ns: 'editor', defaultValue: 'Your treatment has been saved successfully.' })
      });
    } catch (error: any) {
      console.error("Error saving treatment:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToSaveTreatment', { ns: 'editor', defaultValue: 'Failed to save treatment.' }),
        variant: "destructive",
      });
    } finally {
      setSavingTreatment(false);
    }
  };
   const generateCharactersApiCall = async () => {
    setGeneratingCharacters(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea, // Use current state value
          logline: logline, // Use current state value
          synopsis: synopsis, // Use current state value
          existingCharacters: characters.map(c => ({ name: c.name, description: c.description })),
          language: currentLanguage,
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
      toast({ title: t("Success"), description: t("Characters generated successfully!") });
      updateTokenUsage("character_generation", "Generate Characters");
    } catch (error: any) {
      console.error("Error generating characters:", error);
      toast({
        title: t("Error"),
        description: error.message || t("Failed to generate characters."),
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
      name: t('placeholders.characterName', { ns: 'editor', defaultValue: 'New Character' }),
      description: '',
      backstory: '',
      motivation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCharacters(prev => [...prev, newCharacter]);
    toast({ 
      title: t('notifications.characterAdded', { ns: 'editor', defaultValue: 'Character Added (Locally)' }), 
      description: t('notifications.saveTopersist', { ns: 'editor', defaultValue: 'Save to persist changes.' }) 
    });
  };
  const generateScenesApiCall = async () => {
    if (!idea || !logline || !treatment || characters.length === 0) {
      toast({
        title: t("Cannot Generate Scenes"),
        description: t("Idea, Logline, Treatment, and at least one Character are required to generate scenes."),
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
          language: currentLanguage,
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
      toast({ title: t("Success"), description: t("Scenes generated successfully!") });
      updateTokenUsage("scenes", "Generate Scenes");
    } catch (error: any) {
      console.error("Error generating scenes:", error);
      toast({
        title: t("Error"),
        description: error.message || t("Failed to generate scenes."),
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
      title: t('placeholders.sceneTitle', { ns: 'editor', defaultValue: 'New Scene' }),
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
    toast({
      title: t('notifications.sceneAdded', { ns: 'editor', defaultValue: 'Scene Added (Locally)' }),
      description: t('notifications.saveTopersist', { ns: 'editor', defaultValue: 'Save to persist changes.' })
    });
  };

  const generateSceneScriptApiCall = async (sceneId: string) => {
    const sceneToGenerate = scenes.find(s => s.id === sceneId);
    if (!sceneToGenerate) {
      toast({ title: t("Error"), description: t("Scene not found."), variant: "destructive" });
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
          projectLanguage: currentLanguage,
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
      
      toast({ title: t("Success"), description: t(`Script generated for scene "${sceneToGenerate.title}"`) });
    } catch (error: any) {
      console.error(`Error generating script for scene ${sceneId}:`, error);
      toast({
        title: t("Error"),
        description: error.message || t("Failed to generate scene script."),
        variant: "destructive",
      });
    } finally {
      setGeneratingSceneScript(null);
    }
  };

  const generateSceneStoryboardApiCall = async (sceneId: string) => {
    const sceneToGenerate = scenes.find(s => s.id === sceneId);
    if (!sceneToGenerate) {
      toast({ title: t("Error"), description: t("Scene not found."), variant: "destructive" });
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
          projectLanguage: currentLanguage,
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

      toast({ title: t("Success"), description: t(`Storyboard generated for scene "${sceneToGenerate.title}"`) });
    } catch (error: any) {
      console.error(`Error generating storyboard for scene ${sceneId}:`, error);
      toast({
        title: t("Error"),
        description: error.message || t("Failed to generate scene storyboard."),
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
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('messages.failedToGenerateScript', { ns: 'editor', defaultValue: 'Failed to generate full script' }));
      }

      const data = await response.json();
      setFullScript(data.fullScript);
      setProject(prev => prev ? { ...prev, fullScript: data.fullScript } : null);

      if (data.tokensUsed && data.cost && project) {
        setTokenUpdates(prev => [...prev, {
          id: `full-script-${projectId}-${Date.now()}`,
          tokens: data.tokensUsed,
          cost: data.cost,
          timestamp: Date.now(),
          type: "script",
          operation: `${t('operations.fullScriptGeneration', { ns: 'editor' })}: ${project.title}`
        }]);
        updateTokenUsage("script", `${t('operations.fullScriptGeneration', { ns: 'editor' })}: ${project.title}`);
      }

      toast({ 
        title: t('messages.success', { ns: 'editor', defaultValue: 'Success' }), 
        description: t('notifications.scriptGeneratedSuccess', { ns: 'editor', defaultValue: 'Full script generated successfully!' })
      });
      setActiveTab("full-script");
    } catch (error: any) {
      console.error("Error generating full script:", error);
      toast({
        title: t('messages.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('messages.failedToGenerateScript', { ns: 'editor', defaultValue: 'Failed to generate full script.' }),
        variant: "destructive"
      });
    } finally {
      setGeneratingFullScript(false);
    }
  };

  const saveFullScriptApiCall = async () => {
    if (!project || fullScript === null) {
      toast({
        title: t('messages.error', { ns: 'editor', defaultValue: 'Nothing to save' }),
        description: t('messages.emptyScript', { ns: 'editor', defaultValue: 'Full script is empty or project not loaded.' }),
        variant: "destructive"
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
        throw new Error(errorData.error || t('messages.failedToSaveScript', { ns: 'editor', defaultValue: 'Failed to save full script' }));
      }
      const updatedProject = await response.json();
      
      setProject(prev => prev ? { ...prev, fullScript: updatedProject.fullScript !== undefined ? updatedProject.fullScript : fullScript } : null);
      if (updatedProject.fullScript !== undefined) {
        setFullScript(updatedProject.fullScript);
      }
      
      toast({ 
        title: t('messages.success', { ns: 'editor', defaultValue: 'Success' }), 
        description: t('notifications.scriptSavedSuccess', { ns: 'editor', defaultValue: 'Full script saved successfully!' })
      });
    } catch (error: any) {
      console.error("Error saving full script:", error);
      toast({
        title: t('messages.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('messages.failedToSaveScript', { ns: 'editor', defaultValue: 'Failed to save full script.' }),
        variant: "destructive"
      });
    } finally {
      setSavingFullScript(false);
    }
  };

  const copyFullScriptToClipboard = () => {
    if (fullScript && fullScript.trim() !== "") {
      navigator.clipboard.writeText(fullScript)
        .then(() => {
          toast({ 
            title: t('messages.success', { ns: 'editor', defaultValue: 'Copied!' }), 
            description: t('notifications.scriptCopied', { ns: 'editor', defaultValue: 'Full script copied to clipboard.' })
          });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({ 
            title: t('messages.error', { ns: 'editor', defaultValue: 'Error' }), 
            description: t('messages.failedToCopy', { ns: 'editor', defaultValue: 'Failed to copy script.' }), 
            variant: "destructive" 
          });
        });
    } else {
      toast({ 
        title: t('messages.error', { ns: 'editor', defaultValue: 'Nothing to copy' }), 
        description: t('messages.emptyScript', { ns: 'editor', defaultValue: 'Full script is empty.' }), 
        variant: "default" 
      });
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
      toast({ 
        title: t('messages.success', { ns: 'editor', defaultValue: 'Downloaded' }), 
        description: t('notifications.scriptDownloaded', { ns: 'editor', defaultValue: 'Full script download started.' })
      });
    } else {
      toast({ 
        title: t('messages.error', { ns: 'editor', defaultValue: 'Nothing to download' }), 
        description: t('messages.emptyScript', { ns: 'editor', defaultValue: 'Full script is empty.' }), 
        variant: "default" 
      });
    }
  };

  const saveCharacterApiCall = async (characterToSave: Character) => {
    setSavingCharacterId(characterToSave.clientId || characterToSave.id);
    try {
      const response = await fetch(`/api/projects/${projectId}/characters/${characterToSave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterToSave.name,
          description: characterToSave.description,
          backstory: characterToSave.backstory,
          motivation: characterToSave.motivation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save character');
      }

      const data = await response.json();
      setCharacters(prev => prev.map(char => 
        char.clientId === characterToSave.clientId || char.id === characterToSave.id 
          ? { ...char, ...data, id: data.id } 
          : char
      ));
      
      toast({
        title: t('notifications.characterSaved', { ns: 'editor', defaultValue: 'Character Saved' }),
        description: t('notifications.characterSavedSuccess', { ns: 'editor', defaultValue: 'Your character has been saved successfully.' })
      });
    } catch (error: any) {
      console.error("Error saving character:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToSaveCharacter', { ns: 'editor', defaultValue: 'Failed to save character.' }),
        variant: "destructive",
      });
    } finally {
      setSavingCharacterId(null);
    }
  };

  const deleteCharacterApiCall = async (characterToDelete: Character) => {
    setDeletingCharacterId(characterToDelete.clientId || characterToDelete.id);
    try {
      // If character has a real ID (not a clientId), delete from database
      if (characterToDelete.id && !characterToDelete.id.startsWith('temp-') && !characterToDelete.id.startsWith('manual-')) {
        const response = await fetch(`/api/projects/${projectId}/characters/${characterToDelete.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete character');
        }
      }

      // Remove from local state
      setCharacters(prev => prev.filter(char => 
        char.clientId !== characterToDelete.clientId && char.id !== characterToDelete.id
      ));
      
      toast({
        title: t('notifications.characterDeleted', { ns: 'editor', defaultValue: 'Character Deleted' }),
        description: t('notifications.characterDeletedSuccess', { ns: 'editor', defaultValue: 'Character has been deleted successfully.' })
      });
    } catch (error: any) {
      console.error("Error deleting character:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToDeleteCharacter', { ns: 'editor', defaultValue: 'Failed to delete character.' }),
        variant: "destructive",
      });
    } finally {
      setDeletingCharacterId(null);
    }
  };

  const saveSceneApiCall = async (sceneToSave: Scene) => {
    setSavingSceneId(sceneToSave.id);

    const isNewScene = sceneToSave.id.startsWith('temp-') || sceneToSave.id.startsWith('manual-');
    const apiUrl = isNewScene
      ? `/api/projects/${projectId}/scenes`
      : `/api/projects/${projectId}/scenes/${sceneToSave.id}`;
    const httpMethod = isNewScene ? 'POST' : 'PATCH';

    try {
      const { isSummaryExpanded, isStoryboardExpanded, isScriptExpanded, ...sceneDataForApi } = sceneToSave;

      const response = await fetch(apiUrl, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sceneDataForApi),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('messages.failedToSaveScene', { ns: 'editor', defaultValue: 'Failed to save scene' }));
      }

      const savedScene = await response.json();

      setScenes(prevScenes =>
        prevScenes.map(s =>
          s.id === sceneToSave.id ? { ...s, ...savedScene, id: savedScene.id } : s
        )
      );

      toast({
        title: t('messages.success', { ns: 'editor', defaultValue: 'Success' }),
        description: t('notifications.sceneSaved', { 
          ns: 'editor', 
          defaultValue: 'Scene "{{title}}" {{action}} successfully.',
          interpolation: {
            title: savedScene.title,
            action: isNewScene ? t('created', { ns: 'editor' }) : t('updated', { ns: 'editor' })
          }
        })
      });
    } catch (error: any) {
      console.error(`Error ${isNewScene ? 'creating' : 'updating'} scene:`, error);
      toast({
        title: t('messages.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('messages.failedToSaveScene', { ns: 'editor', defaultValue: 'Failed to save scene.' }),
        variant: "destructive"
      });
    } finally {
      setSavingSceneId(null);
    }
  };

  const generateThemeApiCall = async () => {
    setGeneratingTheme(true);
    try {
      // Replace with your actual API endpoint and payload
      const response = await fetch(`/api/projects/${projectId}/generate-theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          logline,
          treatment,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate theme');
      const data = await response.json();
      setCinematicTheme(data.theme || "");
      toast({ title: t('Success'), description: t('Cinematic theme generated!') });
    } catch (error: any) {
      toast({ title: t('Error'), description: error.message, variant: "destructive" });
    } finally {
      setGeneratingTheme(false);
    }
  };

  const saveThemeApiCall = async () => {
    setSavingTheme(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: cinematicTheme }),
      });
      if (!response.ok) throw new Error('Failed to save theme');
      toast({ title: t('Success'), description: t('Theme saved!') });
    } catch (error: any) {
      toast({ title: t('Error'), description: error.message, variant: 'destructive' });
    } finally {
      setSavingTheme(false);
    }
  };

  const generateVisualElementsApiCall = async () => {
    setGeneratingVisualElements(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-visual-elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          logline,
          treatment,
          theme: cinematicTheme,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate visual elements');
      const data = await response.json();
      setVisualStyle(data.visualStyle || "");
      setKeyVisualMoments(data.keyVisualMoments || "");
      toast({ title: t('Success'), description: t('Visual elements generated!') });
    } catch (error: any) {
      toast({ title: t('Error'), description: error.message, variant: 'destructive' });
    } finally {
      setGeneratingVisualElements(false);
    }
  };

  const saveVisualElementsApiCall = async () => {
    setSavingVisualElements(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visualStyle, keyVisualMoments }),
      });
      if (!response.ok) throw new Error('Failed to save visual elements');
      toast({ title: t('Success'), description: t('Visual elements saved!') });
    } catch (error: any) {
      toast({ title: t('Error'), description: error.message, variant: 'destructive' });
    } finally {
      setSavingVisualElements(false);
    }
  };

  const generateSynopsisApiCall = async () => {
    setGeneratingSynopsis(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-synopsis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea,
          logline: logline,
          treatment: treatment,
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate synopsis');
      }

      const data = await response.json();
      setSynopsis(data.synopsis || "");
      
      toast({
        title: t('notifications.synopsisGenerated', { ns: 'editor', defaultValue: 'Synopsis Generated' }),
        description: t('notifications.synopsisGeneratedSuccess', { ns: 'editor', defaultValue: 'Your synopsis has been generated successfully.' })
      });
      
      updateTokenUsage("synopsis", "Generate Synopsis");
    } catch (error: any) {
      console.error("Error generating synopsis:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToGenerateSynopsis', { ns: 'editor', defaultValue: 'Failed to generate synopsis.' }),
        variant: "destructive",
      });
    } finally {
      setGeneratingSynopsis(false);
    }
  };

  const saveSynopsisApiCall = async () => {
    setSavingSynopsis(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/synopsis`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          synopsis: synopsis,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save synopsis');
      }

      const data = await response.json();
      setProject(prev => prev ? { ...prev, synopsis: data.synopsis } : null);
      
      toast({
        title: t('notifications.synopsisSaved', { ns: 'editor', defaultValue: 'Synopsis Saved' }),
        description: t('notifications.synopsisSavedSuccess', { ns: 'editor', defaultValue: 'Your synopsis has been saved successfully.' })
      });
    } catch (error: any) {
      console.error("Error saving synopsis:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToSaveSynopsis', { ns: 'editor', defaultValue: 'Failed to save synopsis.' }),
        variant: "destructive",
      });
    } finally {
      setSavingSynopsis(false);
    }
  };

  const generatePlotPointsApiCall = async () => {
    setGeneratingPlotPoints(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-plot-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logline: logline,
          treatment: treatment,
          synopsis: synopsis,
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plot points');
      }

      const data = await response.json();
      setPlotPoints(data.plotPoints || "");
      
      toast({
        title: t('notifications.plotPointsGenerated', { ns: 'editor', defaultValue: 'Plot Points Generated' }),
        description: t('notifications.plotPointsGeneratedSuccess', { ns: 'editor', defaultValue: 'Your plot points have been generated successfully.' })
      });
      
      updateTokenUsage("plot-points", "Generate Plot Points");
    } catch (error: any) {
      console.error("Error generating plot points:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToGeneratePlotPoints', { ns: 'editor', defaultValue: 'Failed to generate plot points.' }),
        variant: "destructive",
      });
    } finally {
      setGeneratingPlotPoints(false);
    }
  };

  const savePlotPointsApiCall = async () => {
    setSavingPlotPoints(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/plot-points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotPoints: plotPoints,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save plot points');
      }

      const data = await response.json();
      setProject(prev => prev ? { ...prev, plotPoints: data.plotPoints } : null);
      
      toast({
        title: t('notifications.plotPointsSaved', { ns: 'editor', defaultValue: 'Plot Points Saved' }),
        description: t('notifications.plotPointsSavedSuccess', { ns: 'editor', defaultValue: 'Your plot points have been saved successfully.' })
      });
    } catch (error: any) {
      console.error("Error saving plot points:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToSavePlotPoints', { ns: 'editor', defaultValue: 'Failed to save plot points.' }),
        variant: "destructive",
      });
    } finally {
      setSavingPlotPoints(false);
    }
  };

  const exportProjectApiCall = async (format: 'markdown' | 'json') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export project');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || `project-${format}.${format}`;

      // Create a blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t('notifications.projectExported', { ns: 'editor', defaultValue: 'Project Exported' }),
        description: t('notifications.projectExportedSuccess', { ns: 'editor', defaultValue: 'Your project has been exported successfully.' })
      });
    } catch (error: any) {
      console.error("Error exporting project:", error);
      toast({
        title: t('notifications.error', { ns: 'editor', defaultValue: 'Error' }),
        description: error.message || t('notifications.failedToExportProject', { ns: 'editor', defaultValue: 'Failed to export project.' }),
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setShowExportMenu(false);
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
        <p className="text-xl"><T k="messages.projectNotFound" ns="editor" defaultValue="Project not found or access denied." /></p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          <T k="messages.goToDashboard" ns="editor" defaultValue="Go to Dashboard" />
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
        </div>
        <AIOperationProgress
          isGenerating={!!generatingScript || !!generatingStoryboard || generatingTreatment || generatingIdea || generatingLogline || generatingCharacters || generatingScenes || !!generatingSceneScript || !!generatingSceneStoryboard || generatingFullScript || savingFullScript || generatingSynopsis || generatingPlotPoints || savingPlotPoints}
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
            generatingSynopsis ? "synopsis" :
            generatingPlotPoints ? "plot-points" :
            "script" // Default
          }
          operationName={
            generatingScript ? t("ai.operationProgress", { ns: "editor", defaultValue: "Full Script Generation" }) : 
            generatingStoryboard ? t("ai.operationProgress", { ns: "editor", defaultValue: "Full Storyboard Generation" }) :
            generatingSceneScript ? t("ai.operationProgress", { ns: "editor", defaultValue: "Scene Script Generation" }) : 
            generatingSceneStoryboard ? t("ai.operationProgress", { ns: "editor", defaultValue: "Scene Storyboard Generation" }) : 
            generatingFullScript ? t("ai.operationProgress", { ns: "editor", defaultValue: "Full Script Generation" }) : 
            savingFullScript ? t("status.saving", { ns: "editor", defaultValue: "Saving Full Script" }) : // Added saving full script
            generatingTreatment ? t("ai.operationProgress", { ns: "editor", defaultValue: "Treatment Generation" }) :
            generatingIdea ? t("ai.operationProgress", { ns: "editor", defaultValue: "Idea Generation" }) : 
            generatingLogline ? t("ai.operationProgress", { ns: "editor", defaultValue: "Logline Generation" }) :
            generatingCharacters ? t("ai.operationProgress", { ns: "editor", defaultValue: "Character Generation" }) :
            generatingScenes ? t("ai.operationProgress", { ns: "editor", defaultValue: "Scene Generation" }) :
            generatingSynopsis ? t("ai.operationProgress", { ns: "editor", defaultValue: "Synopsis Generation" }) :
            generatingPlotPoints ? t("ai.operationProgress", { ns: "editor", defaultValue: "Plot Points Generation" }) :
            t("ai.operationProgress", { ns: "editor", defaultValue: "AI Generation" }) // Default
          }
        />
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                  title={t('toolbar.backToDashboard', { ns: 'editor', defaultValue: 'Back to Dashboard' })}
                >
                  <Icons.arrowLeft className="h-4 w-4" />
                </Button>
                {project && (
                  <h1 className="text-lg font-semibold text-white">
                    {project.title}
                  </h1>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <TokenAnimationDisplay 
                  tokenUsage={tokenUsage}
                  tokenUpdates={[]} // We'll implement real-time updates later
                />
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exporting}
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                    title={t('toolbar.export', { ns: 'editor', defaultValue: 'Export Project' })}
                  >
                    {exporting ? (
                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{t('Exporting...')}</>
                    ) : (
                      <><Download className="h-4 w-4 mr-2" />{t('Export')}</>
                    )}
                  </Button>
                  
                  {/* Export Dropdown Menu */}
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl z-50">
                      <div className="py-2">
                        <button
                          onClick={() => exportProjectApiCall('markdown')}
                          disabled={exporting}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                        >
                          <Icons.fileText className="h-4 w-4" />
                          {t('Export as Markdown', { ns: 'editor', defaultValue: 'Export as Markdown' })}
                        </button>
                        <button
                          onClick={() => exportProjectApiCall('json')}
                          disabled={exporting}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                        >
                          <Icons.fileText className="h-4 w-4" />
                          {t('Export as JSON', { ns: 'editor', defaultValue: 'Export as JSON' })}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <LanguageSwitcher 
                  currentLanguage={currentLanguage}
                  onLanguageChange={onLanguageChange}
                />
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
                {projectConfig.labels?.[step] || t(`tabs.${step}`, { ns: 'editor', defaultValue: step.charAt(0).toUpperCase() + step.slice(1) })}
              </TabsTrigger>
            )) || (
              <>
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <T k="tabs.overview" ns="editor" defaultValue="Overview" />
                </TabsTrigger>
                <TabsTrigger value="characters" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <T k="tabs.characters" ns="editor" defaultValue="Characters" />
                </TabsTrigger>
                <TabsTrigger value="scenes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <T k="tabs.scenes" ns="editor" defaultValue="Scenes" />
                </TabsTrigger>
                <TabsTrigger value="full-script" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <T k="tabs.fullScript" ns="editor" defaultValue="Full Script" />
                </TabsTrigger>
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
      
      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </ScrollArea>
  );
}