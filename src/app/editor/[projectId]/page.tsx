"use client";

import { useEffect, useState, useRef } from "react";
import { AlertCircle as IAlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StoryboardSection } from '@/components/StoryboardSection';
import { TokenAnimationDisplay } from '@/components/TokenAnimationDisplay';
import { AIOperationProgress } from '@/components/AIOperationProgress';
import { OperationNotification } from '@/components/OperationNotification';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import { GoogleTransliterateTextarea } from '@/components/GoogleTransliterateTextarea';
import { IdeaGenerator, IdeaGeneratorHandle } from '@/components/ideas/idea-generator'; // Added IdeaGeneratorHandle
import { Save } from "lucide-react"; // Import Save icon if not already imported via Icons

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
  createdAt: string;
  updatedAt: string;
  isSummaryExpanded: boolean;
  isStoryboardExpanded: boolean;
}

interface Character {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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
  type: "script" | "storyboard" | "treatment" | "idea";
  operation: string;
}

interface ShareLink {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

const getCardTypesForProject = (projectType: string | null): CardType[] => {
  switch (projectType) {
    case "shortfilm":
      return ["scene", "dialogue", "shortfilm"];
    case "story":
      return ["story", "scene", "dialogue"];
    case "screenplay":
      return ["scene", "act", "dialogue"];
    default:
      return ["story", "scene", "dialogue"];
  }
};

const cardTypeLabels: Record<CardType, string> = {
  story: "Story",
  scene: "Scene", 
  act: "Act",
  dialogue: "Dialogue",
  shortfilm: "Short Film",
  advertisement: "Advertisement",
};

const cardTypeIcons: Record<CardType, React.ReactNode> = {
  story: <Icons.book className="h-5 w-5" />,
  scene: <Icons.film className="h-5 w-5" />,
  act: <Icons.theater className="h-5 w-5" />,
  dialogue: <Icons.messageSquare className="h-5 w-5" />,
  shortfilm: <Icons.video className="h-5 w-5" />,
  advertisement: <Icons.megaphone className="h-5 w-5" />,
};

// Define the interface for a generated idea
interface GeneratedIdea {
  Title: string;
  Concept: string;
  Conflict?: string;
  EmotionalHook?: string;
  VisualStyle?: string;
  UniqueElement?: string;
}

export default function EditorPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [progress, setProgress] = useState(0);
  const [logline, setLogline] = useState<string>("");
  const [idea, setIdea] = useState<string>("");
  const [treatment, setTreatment] = useState<string>("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [savingLogline, setSavingLogline] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const [savingCharacter, setSavingCharacter] = useState<string | null>(null);
  const [savingScene, setSavingScene] = useState<string | null>(null);
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);
  const [generatingStoryboard, setGeneratingStoryboard] = useState<string | null>(null);
  const [selectedStoryboard, setSelectedStoryboard] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'single' | 'slideshow' | 'compare'>('single');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [compareStoryboard, setCompareStoryboard] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [tokenUpdates, setTokenUpdates] = useState<TokenUpdate[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [creatingShare, setCreatingShare] = useState(false);
  const [shareExpiresIn, setShareExpiresIn] = useState(7);
  const [exportFormat, setExportFormat] = useState<"markdown" | "json" | "pdf">("markdown");
  const [exporting, setExporting] = useState(false);
  const [generatingTreatment, setGeneratingTreatment] = useState(false);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [generatingLogline, setGeneratingLogline] = useState(false); // Added state for generating logline
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [isTransliterationEnabled, setIsTransliterationEnabled] = useState(false);

  // States for the new Idea Selection Dialog
  const [fetchedIdeas, setFetchedIdeas] = useState<GeneratedIdea[]>([]);
  const [showIdeaSelectionDialog, setShowIdeaSelectionDialog] = useState(false);

  const ideaGeneratorRef = useRef<IdeaGeneratorHandle>(null);

  // Define supported languages (keys from your API's languageMap)
  const supportedTranslationLanguages = [
    "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", 
    "Gujarati", "Marathi", "Bengali", "Punjabi", "Urdu", "English"
  ];

  const currentProjectLanguage = project?.language && supportedTranslationLanguages.includes(project.language) 
    ? project.language 
    : "English";

  // Translation hook
  const { translate, isTranslating, translateAsync, preloadTranslations } = useTranslation({
    targetLanguage: currentProjectLanguage,
    enabled: !!(currentProjectLanguage && currentProjectLanguage !== 'English')
  });

  // Preload common UI translations when language changes
  useEffect(() => {
    // Only preload if currentProjectLanguage is a valid, non-English supported language
    if (currentProjectLanguage && currentProjectLanguage !== 'English' && supportedTranslationLanguages.includes(currentProjectLanguage)) {
      const commonUILabels = [
        'Idea', 'Generate Idea', 'Save', 'Saving...', 'Logline', 'Generate Logline', 'Treatment', 
        'Generate Treatment', 'Save Treatment', 'Characters', 'Add Character',
        'Scenes', 'Add Scene', 'Scene Summary', 'Script', 'Generate Script',
        'Generate Storyboard', 'Generating...'
      ];
      preloadTranslations(commonUILabels);
    }
  }, [project?.language, preloadTranslations]);

  // Language update handler
  const handleLanguageChange = async (newLanguage: string) => {
    if (!project) return;
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: newLanguage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project language');
      }

      const updatedProjectData = await response.json(); // API returns { id, language, updatedAt }
      
      // Correctly update the project state by merging new language
      setProject(prevProject => {
        if (!prevProject) return null;
        return {
          ...prevProject,
          language: updatedProjectData.language,
        };
      });
      
      toast({
        title: "Success",
        description: "Project language updated successfully. UI will now reflect the change.",
      });

    } catch (error) {
      console.error("[EditorPage] Error updating language:", error);
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : "Failed to update project language"),
        variant: "destructive",
      });
    }
  };

  const handleIdeaSelectedFromGenerator = (selectedIdea: string) => {
    setIdea(selectedIdea); // Update the main idea field in EditorPage
    toast({
      title: translate("Idea Applied"),
      description: translate("The selected idea has been populated into the main idea field."),
    });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.statusText}`);
        }
        const data: Project = await response.json();
        setProject(data);
        const completedCards = data.cards.filter((card) => card.content.trim().length > 0).length;
        const totalCards = data.cards.length || 1;
        setProgress((completedCards / totalCards) * 100);
        if (data.type === "shortfilm") {
          setLogline(data.logline || "");
          setIdea(data.idea || "");
          setTreatment(data.treatment || "");
          setCharacters(data.characters || []);
          setScenes(data.scenes.map(s => ({ ...s, isSummaryExpanded: false, isStoryboardExpanded: false })) || []);
        }
        // Fetch initial token usage
        await updateTokenUsage();
      } catch (error) {
        console.error("[EditorPage] Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, toast]);

  useEffect(() => {
    const fetchShareLinks = async () => {
      if (!project) return;
      try {
        const res = await fetch(`/api/projects/${project.id}/share`);
        if (res.ok) {
          const links = await res.json();
          setShareLinks(links);
        }
      } catch (error) {
        console.error("[EditorPage] Error fetching share links:", error);
      }
    };

    if (showShareDialog) {
      fetchShareLinks();
    }
  }, [project, showShareDialog]);

  const addCard = async (type: CardType) => {
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, order: project.cards.length }),
      });

      if (!response.ok) throw new Error("Failed to add card");
      const newCard: ProjectCard = await response.json();
      setProject((prev) =>
        prev
          ? {
              ...prev,
              cards: [...prev.cards, newCard],
            }
          : null
      );

      toast({
        title: "Success",
        description: `Added new ${cardTypeLabels[type]} card`,
      });
    } catch (error) {
      console.error("[EditorPage] Error adding card:", error);
      toast({
        title: "Error",
        description: "Failed to add card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateCard = async (cardId: string, content: string) => {
    if (!project) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/projects/${project.id}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to update card");
      const updatedCard: ProjectCard = await response.json();
      setProject((prev) =>
        prev
          ? {
              ...prev,
              cards: prev.cards.map((card) => (card.id === cardId ? updatedCard : card)),
            }
          : null
      );

      // Update progress
      const completedCards = project.cards.filter((card) =>
        card.id === cardId ? content.trim().length > 0 : card.content.trim().length > 0
      ).length;
      const totalCards = project.cards.length || 1; // Avoid division by zero
      setProgress((completedCards / totalCards) * 100);
    } catch (error) {
      console.error("[EditorPage] Error updating card:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveLogline = async () => {
    if (!project) return;
    setSavingLogline(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/logline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: logline }), // Changed from { logline } to { content: logline }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save logline");
      }
      setProject((prev) => prev ? { ...prev, logline } : prev); // Update project state
      toast({
        title: "Success",
        description: "Logline saved successfully",
      });
    } catch (error) {
      console.error("[EditorPage] Error saving logline:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save logline";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingLogline(false);
    }
  };

  const saveIdea = async () => {
    if (!project) return;
    setSavingIdea(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/ideas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: idea }),
      });
      if (!res.ok) throw new Error("Failed to save idea");
      setProject((prev) => prev ? { ...prev, idea } : prev);
      toast({
        title: "Success",
        description: "Idea saved successfully",
      });
    } catch (error) {
      console.error("[EditorPage] Error saving idea:", error);
      toast({
        title: "Error",
        description: "Failed to save idea",
        variant: "destructive",
      });
    } finally {
      setSavingIdea(false);
    }
  };

  const saveCharacter = async (characterId: string, name: string, description: string) => {
    if (!project) return;
    setSavingCharacter(characterId);
    try {
      const res = await fetch(`/api/projects/${project.id}/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to save character");
      toast({
        title: "Success",
        description: "Character saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save character",
        variant: "destructive",
      });
    } finally {
      setSavingCharacter(null);
    }
  };

  const saveScene = async (sceneId: string, title: string, summary: string, script: string | null) => {
    if (!project) return;
    setSavingScene(sceneId);
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/${sceneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, script }),
      });
      if (!res.ok) throw new Error("Failed to save scene");
      toast({
        title: "Success",
        description: "Scene saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save scene",
        variant: "destructive",
      });
    } finally {
      setSavingScene(null);
    }
  };

  const saveTreatment = async (newTreatment: string) => {
    if (!project) return;
    setSavingTreatment(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/treatment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newTreatment }),
      });
      if (!res.ok) throw new Error("Failed to save treatment");
      setProject((prev) => prev ? { ...prev, treatment: newTreatment } : prev);
      toast({ title: "Success", description: "Treatment saved successfully" });
    } catch (error) {
      console.error("[EditorPage] Error saving treatment:", error);
      toast({ title: "Error", description: "Failed to save treatment", variant: "destructive" });
    } finally {
      setSavingTreatment(false);
    }
  };

  const addCharacter = async () => {
    if (!project) return;
    try {
      // Pool of Indian names to cycle through
      const indianNames = ['Arjun', 'Priya', 'Kiran', 'Meera', 'Rajesh', 'Ananya', 'Vikram', 'Kavya', 'Arun', 'Divya', 'Rohan', 'Shreya'];
      const characterName = indianNames[characters.length % indianNames.length];
      
      const res = await fetch(`/api/projects/${project.id}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: characterName,
          description: "New character description"
        }),
      });
      if (!res.ok) throw new Error("Failed to add character");
      const newCharacter = await res.json();
      setCharacters([...characters, newCharacter]);
      toast({
        title: "Success",
        description: "Character added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add character",
        variant: "destructive",
      });
    }
  };

  const addScene = async () => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Scene ${scenes.length + 1}`,
          summary: "New scene summary",
          order: scenes.length
        }),
      });
      if (!res.ok) throw new Error("Failed to add scene");
      const newScene = await res.json();
      setScenes([...scenes, newScene]);
      toast({
        title: "Success",
        description: "Scene added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add scene",
        variant: "destructive",
      });
    }
  };

  const deleteCharacter = async (characterId: string) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/characters/${characterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to delete character");
      setCharacters(characters.filter(c => c.id !== characterId));
      toast({
        title: "Success",
        description: "Character deleted successfully",
      });
    } catch (error) {
      console.error("[EditorPage] Error deleting character:", error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive",
      });
    }
  };

  const deleteScene = async (sceneId: string) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/${sceneId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to delete scene");
      setScenes(scenes.filter(s => s.id !== sceneId));
      toast({
        title: "Success",
        description: "Scene deleted successfully",
      });
    } catch (error) {
      console.error("[EditorPage] Error deleting scene:", error);
      toast({
        title: "Error",
        description: "Failed to delete scene",
        variant: "destructive",
      });
    }
  };

  const updateTokenUsage = async (operationType?: "script" | "storyboard" | "treatment" | "idea", operationName?: string) => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/usage`);
      if (!response.ok) throw new Error("Failed to fetch usage data");
      const data = await response.json();
      
      // Add update animation with enhanced information
      if (tokenUsage && (data.totalTokens !== tokenUsage.totalTokens || data.totalCost !== tokenUsage.totalCost)) {
        const tokensUsed = data.totalTokens - (tokenUsage?.totalTokens || 0);
        const costIncurred = data.totalCost - (tokenUsage?.totalCost || 0);
        
        // Only add animation if there are actual changes
        if (tokensUsed > 0 || costIncurred > 0) {
          setTokenUpdates(prev => [...prev, {
            id: Date.now().toString(),
            tokens: tokensUsed,
            cost: costIncurred,
            timestamp: Date.now(),
            type: operationType || "script",
            operation: operationName || "AI Generation"
          }]);

          // Remove old updates after animation
          setTimeout(() => {
            setTokenUpdates(prev => prev.filter(update => Date.now() - update.timestamp < 4000));
          }, 4000);
        }
      }
      
      setTokenUsage(data);
    } catch (error) {
      console.error("[EditorPage] Error fetching token usage:", error);
    }
  };

  const generateScript = async (sceneId: string) => {
    if (!project) return;
    setGeneratingScript(sceneId);
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/${sceneId}/generate-script`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate script");
      const updatedScene = await res.json();
      setScenes(scenes.map(s => s.id === sceneId ? updatedScene : s));
      await updateTokenUsage("script", "Script Generation");
      toast({
        title: "Success",
        description: "Script generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate script",
        variant: "destructive",
      });
    } finally {
      setGeneratingScript(null);
    }
  };

  const generateStoryboard = async (sceneId: string) => {
    if (!project) return;
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene?.script) {
      toast({
        title: "Error",
        description: "Please generate a script first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingStoryboard(sceneId);
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/${sceneId}/generate-storyboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: scene.script,
          title: scene.title,
          summary: scene.summary
        }),
      });
      if (!res.ok) throw new Error("Failed to generate storyboard");
      const updatedScene = await res.json();
      setScenes(scenes.map(s => s.id === sceneId ? updatedScene : s));
      await updateTokenUsage("storyboard", "Storyboard Generation");
      toast({
        title: "Success",
        description: "Storyboard generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate storyboard",
        variant: "destructive",
      });
    } finally {
      setGeneratingStoryboard(null);
    }
  };

  // Add the new generateIdea function here
  const generateIdea = async () => {
    if (!project) return;
    setGeneratingIdea(true);
    setFetchedIdeas([]); // Clear previous ideas
    try {
      const requestBody = idea && idea.trim().length > 0 
        ? { idea: idea, generateRandom: false } 
        : { generateRandom: true };
        
      const res = await fetch(`/api/projects/${project.id}/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate ideas. Status: ${res.status}`);
      }
      
      const data = await res.json();
      let ideasToDisplay: GeneratedIdea[] = [];

      if (data.generatedIdeas && Array.isArray(data.generatedIdeas) && data.generatedIdeas.length > 0) {
        ideasToDisplay = data.generatedIdeas;
      } else if (data.concepts && data.concepts.length > 0 && data.concepts[0].text) {
        // Fallback for older single idea structure (if API still supports it)
        ideasToDisplay = [{ Title: "Generated Idea", Concept: data.concepts[0].text }];
      } else if (data.generatedIdeas && data.generatedIdeas.length > 0 && data.generatedIdeas[0].concept) {
        // Fallback for another possible single idea structure (if API still supports it)
        ideasToDisplay = [{ Title: "Generated Idea", Concept: data.generatedIdeas[0].concept }];
      }

      if (ideasToDisplay.length > 0) {
        setFetchedIdeas(ideasToDisplay);
        setShowIdeaSelectionDialog(true);
        await updateTokenUsage("idea", "Idea Generation");
        toast({ title: "Ideas Generated", description: "Please select an idea from the list." });
      } else {
        console.warn("[EditorPage] Generated idea data is not in expected format or is empty:", data);
        toast({ title: "No Ideas Generated", description: "The AI didn't return any ideas, or the format was unexpected. You can try again.", variant: "default" });
      }
    } catch (error) {
      console.error("[EditorPage] Error generating ideas:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate ideas";
      toast({ title: "Error Generating Ideas", description: errorMessage, variant: "destructive" });
    } finally {
      setGeneratingIdea(false);
    }
  };

  const handleSelectIdea = (selectedIdea: GeneratedIdea) => {
    setIdea(selectedIdea.Concept); // Update the main idea text area
    setProject((prev) => prev ? { ...prev, idea: selectedIdea.Concept } : prev); // Update the project state
    setShowIdeaSelectionDialog(false); // Close the dialog
    setFetchedIdeas([]); // Clear the fetched ideas from state
    toast({ title: "Idea Selected", description: `"${selectedIdea.Title}" has been set as the current idea.` });
    // Optionally, you might want to auto-save the idea here
    // saveIdea(); // Make sure saveIdea uses the current `idea` state or pass selectedIdea.Concept
  };

  const generateLogline = async () => {
    if (!project || !project.idea) {
      toast({
        title: translate("Missing Idea"),
        description: translate("Please generate or write an idea first before generating a logline."),
        variant: "destructive",
      });
      return;
    }
    setGeneratingLogline(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/generate-logline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The API will fetch the idea and language from the project
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate logline. Status: ${res.status}`);
      }
      const data = await res.json();
      setLogline(data.logline);
      setProject((prev) => (prev ? { ...prev, logline: data.logline } : prev));
      await updateTokenUsage("idea", "Logline Generation"); // Assuming logline generation is token-based like ideas
      toast({ title: translate("Logline Generated"), description: translate("A new logline has been generated based on your idea.") });
    } catch (error) {
      console.error("[EditorPage] Error generating logline:", error);
      const errorMessage = error instanceof Error ? error.message : translate("Failed to generate logline");
      toast({ title: translate("Error Generating Logline"), description: errorMessage, variant: "destructive" });
    } finally {
      setGeneratingLogline(false);
    }
  };

  const generateTreatment = async () => {
    if (!project || !project.idea || !project.logline) return;
    setGeneratingTreatment(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/treatment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: project.idea, logline: project.logline }),
      });
      if (!res.ok) throw new Error("Failed to generate treatment");
      const data = await res.json();
      setProject((prev) => prev ? { ...prev, treatment: data.treatment } : prev);
      setTreatment(data.treatment); // Update the local treatment state for the textarea
      await updateTokenUsage("treatment", "Treatment Generation");
      toast({ title: "Success", description: "Treatment generated successfully" });
    } catch (error) {
      console.error("[EditorPage] Error generating treatment:", error);
      toast({ title: "Error", description: "Failed to generate treatment", variant: "destructive" });
    } finally {
      setGeneratingTreatment(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `storyboard-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download storyboard",
        variant: "destructive",
      });
    }
  };

  const handleZoom = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  const handleViewModeChange = (mode: 'single' | 'slideshow' | 'compare') => {
    setViewMode(mode);
    setZoomLevel(100);
    if (mode === 'compare') {
      setCompareStoryboard(null);
    }
  };

  const handleShare = async () => {
    if (!project) return;
    setCreatingShare(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: shareExpiresIn }),
      });
      if (!res.ok) throw new Error("Failed to create share link");
      const data = await res.json();
      
      // Refresh share links
      const linksRes = await fetch(`/api/projects/${project.id}/share`);
      if (linksRes.ok) {
        const links = await linksRes.json();
        setShareLinks(links);
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setCreatingShare(false);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: exportFormat }),
      });
      if (!res.ok) throw new Error("Failed to export project");
      
      // Get filename from Content-Disposition header
      const contentDisposition = res.headers.get("Content-Disposition");
      const filename = contentDisposition?.split("filename=")[1]?.replace(/"/g, "") || "export";
      
      // Download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Project exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export project",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setShowExportDialog(false);
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
  
  const availableCardTypes = getCardTypesForProject(project.type);

  return (
    <ScrollArea className="h-full bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* AI Operation Progress Indicator */}
        <AIOperationProgress
          isGenerating={!!generatingScript || !!generatingStoryboard || generatingTreatment || generatingIdea || generatingLogline}
          operationType={
            generatingScript ? "script" : 
            generatingStoryboard ? "storyboard" : 
            generatingTreatment ? "treatment" : 
            generatingIdea ? "idea" : 
            generatingLogline ? "logline" : "script" // Added idea type
          }
          operationName={
            generatingScript ? "Script Generation" :
            generatingStoryboard ? "Storyboard Generation" :
            generatingTreatment ? "Treatment Generation" :
            generatingIdea ? "Idea Generation" : 
            generatingLogline ? "Logline Generation" : "AI Generation" // Added idea name
          }
        />
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
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
                  value={project.language || 'English'}
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
                    Saving...
                  </span>
                )}
                {/* <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Icons.share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Icons.download className="h-4 w-4 mr-2" />
                  Export
                </Button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}

        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8"></div>
            {project.type === "shortfilm" && (
              <div className="space-y-8">
                 {/* Idea */}
                <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                        <Icons.lightbulb className="h-5 w-5 mr-2" />
                        {translate('Idea')}
                      </h2>
                       <Button
                        onClick={generateIdea} // Use the new generateIdea function
                        disabled={generatingIdea || !!generatingScript || !!generatingStoryboard || generatingTreatment}
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
                        className="bg-white/10 text-white placeholder:text-gray-400 border-white/10 min-h-[60px] w-full"
                        placeholder={translate("Describe your film's idea... (e.g., A young software engineer in Bangalore discovers a family secret during Diwali celebrations, or A street food vendor in Mumbai forms an unlikely friendship with a corporate executive)")}
                        transliterationEnabled={isTransliterationEnabled && currentProjectLanguage === "Telugu"}
                        destinationLanguage={currentProjectLanguage}
                      />
                      <Button
                        onClick={saveIdea}
                        disabled={savingIdea}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {savingIdea ? (
                          <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                        ) : (
                          translate('Save')
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Logline */}
                <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                        <Icons.fileText className="h-5 w-5 mr-2" />
                        {translate('Logline')}
                      </h2>
                       <Button
                        onClick={generateLogline} // Use the new generateLogline function
                        disabled={generatingLogline || !!generatingScript || !!generatingStoryboard || generatingTreatment}
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
                          id="logline"
                          initialValue={logline}
                          onValueChange={(newValue) => setLogline(newValue)}
                          placeholder={translate("Enter your logline here...")}
                          className="bg-white/10 text-white placeholder:text-gray-400 border-white/10 min-h-[60px] w-full"
                          destinationLanguage={currentProjectLanguage} // Changed from targetLanguage
                          transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'} // Changed from enabled
                        />
                        <Button
                        onClick={saveLogline}
                        disabled={savingLogline}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {savingLogline ? (
                          <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                        ) : (
                          translate('Save')
                        )}
                      </Button>
                      {/* <AIOperationProgress 
                        isGenerating={generatingLogline} 
                        operationType="logline" 
                        operationName={translate("Logline Generation")} 
                      /> */}
                    </div>
                  </CardContent>
                </Card>

                {/* Treatment */}
                <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                        <Icons.fileEdit className="h-5 w-5 mr-2" />
                        {translate('Treatment')}
                      </h2>
                      <Button
                        onClick={generateTreatment}
                        disabled={generatingTreatment || !idea || !logline}
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
                        id="treatment"
                        initialValue={treatment}
                        onValueChange={(newValue) => setTreatment(newValue)}
                        placeholder={translate("Enter your treatment here...")}
                        className="min-h-[150px] pr-20" // Added padding for buttons
                        destinationLanguage={currentProjectLanguage} // Changed from targetLanguage
                        transliterationEnabled={isTransliterationEnabled && currentProjectLanguage !== 'English'} // Changed from enabled
                      />
                       <Button
                          onClick={() => saveTreatment(treatment)}
                          disabled={savingTreatment}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                         >
                        {savingTreatment ? (
                          <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                        ) : (
                          translate('Save')
                        )}
                      </Button>
                      {/* <div className="absolute top-1 right-1 flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={generateTreatment}
                          disabled={generatingTreatment || !project?.idea || !project?.logline}
                          className="text-xs px-2 py-1"
                        >
                          {generatingTreatment ? (
                            <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Icons.sparkles className="mr-1 h-3 w-3" />
                          )}
                          {translate("Generate")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveTreatment(treatment)}
                          disabled={savingTreatment}
                          className="text-xs px-2 py-1"
                        >
                          {savingTreatment ? (
                            <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Icons.save className="mr-1 h-3 w-3" /> // Corrected to Icons.save
                          )}
                          {translate("Save")}
                        </Button>
    
                    </div> */}
                    {/* <AIOperationProgress 
                      isGenerating={generatingTreatment} 
                      operationType="treatment" 
                      operationName={translate("Treatment Generation")} 
                    /> */}
                  </div>
                  </CardContent>
                </Card>

                {/* Characters */}
                <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                        <Icons.users className="h-5 w-5 mr-2" />
                        {translate('Characters')}
                      </h2>
                      <Button onClick={addCharacter} variant="outline" className="text-purple-300 border-purple-300 hover:bg-purple-300/10 hover:text-purple-200">
                        <Icons.plus className="h-4 w-4 mr-2" />
                        {translate('Add Character')}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {characters.map((character) => (
                        <Card key={character.id} className="bg-white/10 border-white/20">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <Input
                                id={`character-name-${character.id}`}
                                value={character.name}
                                onChange={(e) => {
                                  const newName = e.target.value;
                                  setCharacters(characters.map(c => c.id === character.id ? { ...c, name: newName } : c));
                                }}
                                className="text-lg font-semibold bg-transparent border-none text-white focus:ring-0 focus:border-none p-0"
                                placeholder={translate("Character Name")}
                              />
                              <Button variant="ghost" size="icon" onClick={() => deleteCharacter(character.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                <Icons.trash className="h-4 w-4" />
                              </Button>
                            </div>
                            <GoogleTransliterateTextarea
                              id={`character-description-${character.id}`}
                              initialValue={character.description}
                              onValueChange={(newDescription) => {
                                setCharacters(characters.map(c => c.id === character.id ? { ...c, description: newDescription } : c));
                              }}
                              className="bg-white/5 text-white placeholder:text-gray-400 border-white/10 min-h-[80px] w-full"
                              placeholder={translate("Character Description (e.g., A grizzled detective haunted by his past, or A naive young woman chasing her dreams in a big city)")}
                              transliterationEnabled={isTransliterationEnabled && currentProjectLanguage === "Telugu"}
                              destinationLanguage="te"
                            />
                            <div className="flex justify-end">
                              <Button 
                                onClick={() => saveCharacter(character.id, character.name, character.description)}
                                disabled={savingCharacter === character.id}
                                size="sm" 
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                {savingCharacter === character.id ? (
                                  <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                                ) : (
                                  translate('Save')
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Scenes */}
                <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                        <Icons.film className="h-5 w-5 mr-2" />
                        {translate('Scenes')}
                      </h2>
                      <Button onClick={addScene} variant="outline" className="text-purple-300 border-purple-300 hover:bg-purple-300/10 hover:text-purple-200">
                        <Icons.plus className="h-4 w-4 mr-2" />
                        {translate('Add Scene')}
                      </Button>
                    </div>
                    <div className="space-y-6">
                      {scenes.map((scene, index) => (
                        <Card key={scene.id} className="bg-white/10 border-white/20 overflow-hidden">
                          <div className="p-4 bg-white/5 flex justify-between items-center">
                            <Input
                              id={`scene-title-${scene.id}`}
                              value={scene.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setScenes(scenes.map(s => s.id === scene.id ? { ...s, title: newTitle } : s));
                              }}
                              className="text-lg font-semibold bg-transparent border-none text-white focus:ring-0 focus:border-none p-0"
                              placeholder={translate("Scene Title")}
                            />
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => deleteScene(scene.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                <Icons.trash className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setScenes(scenes.map(s => s.id === scene.id ? {...s, isSummaryExpanded: !s.isSummaryExpanded} : s))}
                                className="text-gray-400 hover:text-white"
                              >
                                {scene.isSummaryExpanded ? <Icons.chevronUp className="h-5 w-5" /> : <Icons.chevronDown className="h-5 w-5" />}
                              </Button>
                            </div>
                          </div>
                          <AnimatePresence>
                            {scene.isSummaryExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-4 pb-4 pt-2 space-y-3"
                              >
                                <GoogleTransliterateTextarea
                                  id={`scene-summary-${scene.id}`}
                                  initialValue={scene.summary}
                                  onValueChange={(newSummary) => {
                                    setScenes(scenes.map(s => s.id === scene.id ? { ...s, summary: newSummary } : s));
                                  }}
                                  className="bg-white/5 text-white placeholder:text-gray-400 border-white/10 min-h-[100px] w-full"
                                  placeholder={translate("Scene Summary (e.g., John confronts his nemesis in a climactic showdown, or Sarah makes a daring escape from the villain's lair)")}
                                  transliterationEnabled={isTransliterationEnabled && currentProjectLanguage === "Telugu"}
                                  destinationLanguage="te"
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <Button 
                                    onClick={() => saveScene(scene.id, scene.title, scene.summary, scene.script)}
                                    disabled={savingScene === scene.id}
                                    size="sm" 
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    {savingScene === scene.id ? (
                                      <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Saving...')}</>
                                    ) : (
                                      translate('Save Summary')
                                    )}
                                  </Button>
                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={() => generateScript(scene.id)}
                                      disabled={generatingScript === scene.id}
                                      variant="ai" 
                                      size="sm"
                                    >
                                      {generatingScript === scene.id ? (
                                        <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
                                      ) : (
                                        <><Icons.sparkles className="h-4 w-4 mr-2" />{translate('Generate Script')}</>
                                      )}
                                    </Button>
                                    <Button 
                                      onClick={() => generateStoryboard(scene.id)}
                                      disabled={generatingStoryboard === scene.id || !scene.script}
                                      variant="ai" 
                                      size="sm"
                                    >
                                      {generatingStoryboard === scene.id ? (
                                        <><Icons.spinner className="h-4 w-4 animate-spin mr-2" />{translate('Generating...')}</>
                                      ) : (
                                        <><Icons.imagePlay className="h-4 w-4 mr-2" />{translate('Generate Storyboard')}</>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                {scene.script && (
                                  <div className="mt-4 pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-semibold text-purple-300 mb-2">{translate('Script')}</h4>
                                    <Textarea 
                                      value={scene.script} 
                                      readOnly 
                                      className="bg-black/20 text-gray-300 min-h-[150px] font-mono text-sm border-white/10" 
                                    />
                                  </div>
                                )}
                                {scene.storyboard && (
                                  <StoryboardSection 
                                    sceneId={scene.id}
                                    script={scene.script}
                                    storyboard={scene.storyboard}
                                    onStoryboardUpdate={async (storyboardUrl) => {
                                      // This function might need to be implemented if users can upload/update storyboards directly from StoryboardSection
                                      // For now, we'll just update the scene state
                                      setScenes(scenes.map(s => s.id === scene.id ? { ...s, storyboard: storyboardUrl } : s));
                                      // Optionally, save this change to the backend
                                      // await saveScene(scene.id, scene.title, scene.summary, scene.script); 
                                      toast({ title: "Storyboard Updated (Local)", description: "Storyboard URL updated in local state."});
                                    }}
                                    onGenerateStoryboard={() => generateStoryboard(scene.id)}
                                    isGenerating={generatingStoryboard === scene.id}
                                    onViewFullSize={setSelectedStoryboard} 
                                  />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Storyboard Modal */}
          <Dialog open={!!selectedStoryboard} onOpenChange={() => {
            setSelectedStoryboard(null);
            setViewMode('single');
            setZoomLevel(100);
            setCompareStoryboard(null);
          }}>
            <DialogContent className="max-w-6xl w-full bg-black/95 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Storyboard Viewer</DialogTitle>
              </DialogHeader>
              
              {selectedStoryboard && (
                <div className="space-y-4">
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "text-white border-white/20",
                          viewMode === 'single' && "bg-purple-600"
                        )}
                        onClick={() => handleViewModeChange('single')}
                      >
                        <Icons.maximize className="h-4 w-4 mr-2" />
                        Single View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "text-white border-white/20",
                          viewMode === 'slideshow' && "bg-purple-600"
                        )}
                        onClick={() => handleViewModeChange('slideshow')}
                      >
                        <Icons.film className="h-4 w-4 mr-2" />
                        Slideshow
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "text-white border-white/20",
                          viewMode === 'compare' && "bg-purple-600"
                        )}
                        onClick={() => handleViewModeChange('compare')}
                      >
                        <Icons.columns className="h-4 w-4 mr-2" />
                        Compare
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-48">
                        <Icons.zoomOut className="h-4 w-4 text-white" />
                        <Slider
                          value={[zoomLevel]}
                          onValueChange={handleZoom}
                          min={50}
                          max={200}
                          step={10}
                          className="w-full"
                        />
                        <Icons.zoomIn className="h-4 w-4 text-white" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white border-white/20"
                        onClick={() => handleDownload(selectedStoryboard)}
                      >
                        <Icons.download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Image Display */}
                  <div className="relative">
                    {viewMode === 'single' && (
                      <div className="relative aspect-video w-full overflow-auto">
                        <img 
                          src={selectedStoryboard} 
                          alt="Storyboard" 
                          className="w-full h-full object-contain"
                          style={{ transform: `scale(${zoomLevel / 100})` }}
                        />
                      </div>
                    )}

                    {viewMode === 'slideshow' && (
                      <div className="relative aspect-video w-full">
                        {scenes[currentSlideIndex]?.storyboard && (
                          <img 
                            src={scenes[currentSlideIndex].storyboard!} 
                            alt="Storyboard" 
                            className="w-full h-full object-contain"
                            style={{ transform: `scale(${zoomLevel / 100})` }}
                          />
                        )}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white/20"
                            onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentSlideIndex === 0}
                          >
                            <Icons.chevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-white px-2 py-1 bg-black/50 rounded">
                            {currentSlideIndex + 1} / {scenes.filter(s => s.storyboard).length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white/20"
                            onClick={() => setCurrentSlideIndex(prev => Math.min(scenes.filter(s => s.storyboard).length - 1, prev + 1))}
                            disabled={currentSlideIndex === scenes.filter(s => s.storyboard).length - 1}
                          >
                            <Icons.chevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {viewMode === 'compare' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative aspect-video w-full overflow-auto">
                          <img 
                            src={selectedStoryboard} 
                            alt="Storyboard" 
                            className="w-full h-full object-contain"
                            style={{ transform: `scale(${zoomLevel / 100})` }}
                          />
                        </div>
                        <div className="relative aspect-video w-full overflow-auto">
                          {compareStoryboard ? (
                            <img 
                              src={compareStoryboard} 
                              alt="Compare Storyboard" 
                              className="w-full h-full object-contain"
                              style={{ transform: `scale(${zoomLevel / 100})` }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center border border-dashed border-white/20 rounded-lg">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-white border-white/20"
                                onClick={() => {
                                  const otherStoryboards = scenes
                                    .filter(s => s.storyboard && s.storyboard !== selectedStoryboard)
                                    .map(s => s.storyboard);
                                  if (otherStoryboards.length > 0) {
                                    setCompareStoryboard(otherStoryboards[0]);
                                  }
                                }}
                              >
                                <Icons.plus className="h-4 w-4 mr-2" />
                                Add Storyboard
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Idea Selection Dialog */}
          <Dialog open={showIdeaSelectionDialog} onOpenChange={(isOpen) => {
            setShowIdeaSelectionDialog(isOpen);
            if (!isOpen) setFetchedIdeas([]); // Clear ideas if dialog is closed by clicking outside or pressing Esc
          }}>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-black/95 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-purple-300 text-2xl">Choose a Generated Idea</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Select one of the ideas below to use as your project's main concept.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] p-1 pr-3">
                <div className="space-y-4 py-4">
                  {fetchedIdeas.map((genIdea, index) => (
                    <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-purple-400 mb-1">{genIdea.Title || `Generated Idea ${index + 1}`}</h3>
                        <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{genIdea.Concept}</p>
                        {/* You can add more details from genIdea here if needed */}
                        {/* e.g., genIdea.Conflict, genIdea.EmotionalHook */}
                        <div className="flex justify-end mt-3">
                          <Button
                            onClick={() => handleSelectIdea(genIdea)}
                            variant="default"
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Icons.check className="h-4 w-4 mr-2" />
                            Select this Idea
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {fetchedIdeas.length === 0 && !generatingIdea && (
                     <p className="text-center text-gray-500 py-8">No ideas were generated, or the AI did not return any results. Please try again.</p>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => {
                  setShowIdeaSelectionDialog(false);
                  setFetchedIdeas([]); // Also clear ideas on explicit cancel
                }} className="text-gray-300 border-gray-500 hover:bg-gray-700 hover:text-white">
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Share Dialog */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent className="sm:max-w-[425px] bg-black/95 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Share Project</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a shareable link for your project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-white">Expires in</Label>
                  <Select
                    value={shareExpiresIn.toString()}
                    onValueChange={(value) => setShareExpiresIn(parseInt(value))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {shareLinks.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white">Active Share Links</Label>
                    <div className="space-y-2">
                      {shareLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                        >
                          <div className="text-sm text-gray-400">
                            Expires: {new Date(link.expiresAt).toLocaleDateString()}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${process.env.NEXT_PUBLIC_APP_URL}/share/${link.token}`
                              );
                              toast({
                                title: "Success",
                                description: "Share link copied to clipboard",
                              });
                            }}
                          >
                            <Icons.copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleShare}
                  disabled={creatingShare}
                >
                  {creatingShare ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icons.link className="h-4 w-4 mr-2" />
                      Create Share Link
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Export Dialog */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogContent className="sm:max-w-[425px] bg-black/95 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Export Project</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose a format to export your project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <RadioGroup
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as any)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="markdown" id="markdown" />
                    <Label htmlFor="markdown" className="text-white">Markdown</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="text-white">JSON</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" disabled />
                    <Label htmlFor="pdf" className="text-white text-gray-500">PDF (Coming Soon)</Label>
                  </div>
                </RadioGroup>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Icons.download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Operation Success Notifications */}
          <div className="fixed top-4 right-4 z-[60] space-y-4">
            <OperationNotification tokenUpdates={tokenUpdates} />
          </div>
      </div>
    </ScrollArea>
  );
}

// Make sure to find the specific "Generate Idea" button related to the main "Idea" Textarea
// and modify it like this:

// Inside the JSX where the "Idea" section is rendered:
// Find this part (or similar):
/*
<div className="space-y-2">
  <Label htmlFor="idea">{translate('Idea')}</Label>
  <GoogleTransliterateTextarea
    id="idea"
    // ... other props ...
  />
  <div className="flex gap-2">
    <Button onClick={handleGenerateIdea} disabled={generatingIdea || savingIdea}> // THIS BUTTON
      {generatingIdea ? (
        // ... loading state ...
      ) : (
        translate('Generate Idea')
      )}
    </Button>
    <Button onClick={saveIdea} disabled={savingIdea}>
      // ... save button ...
    </Button>
  </div>
</div>
*/

// The change is to modify the "Generate Idea" button as follows:
// Replace its onClick with `() => setShowIdeaGeneratorDialog(true)`
// Adjust its disabled prop, likely to `savingIdea` or removing any `generatingIdea` related state.

// Example of the targeted change:
// ...
// <GoogleTransliterateTextarea
//   id="idea"
//   value={idea}
//   onChange={(e) => setIdea(e.target.value)}
//   // ... other props ...
// />
// <div className="flex gap-2">
//   <Button 
//     onClick={() => setShowIdeaGeneratorDialog(true)} // MODIFIED onClick
//     disabled={savingIdea} // MODIFIED disabled prop (ensure 'generatingIdea' state is not used here if it was before)
//   >
//     {/* Remove any loader that was tied to a 'generatingIdea' state if present */}
//     {translate('Generate Idea')}
//   </Button>
//   <Button onClick={saveIdea} disabled={savingIdea}>
//     {savingIdea ? (
//       <>
//         <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
//         {translate('Saving...')}
//       </>
//     ) : (
//       translate('Save Idea')
//     )}
//   </Button>
// </div>
// ...existing code...
