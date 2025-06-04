"use client";

import { useEffect, useState, useRef } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [savingLogline, setSavingLogline] = useState(false);
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
        // Calculate progress safely
        const completedCards = data.cards.filter((card) => card.content.trim().length > 0).length;
        const totalCards = data.cards.length || 1; // Avoid division by zero
        setProgress((completedCards / totalCards) * 100);
        if (data.type === "shortfilm") {
          setLogline(data.logline || "");
          setCharacters(data.characters || []);
          setScenes(data.scenes || []);
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
        body: JSON.stringify({ logline }),
      });
      if (!res.ok) throw new Error("Failed to save logline");
      toast({
        title: "Success",
        description: "Logline saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save logline",
        variant: "destructive",
      });
    } finally {
      setSavingLogline(false);
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

  const addCharacter = async () => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Character ${characters.length + 1}`,
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

  const updateTokenUsage = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/usage`);
      if (!response.ok) throw new Error("Failed to fetch usage data");
      const data = await response.json();
      
      // Add update animation
      if (tokenUsage && (data.totalTokens !== tokenUsage.totalTokens || data.totalCost !== tokenUsage.totalCost)) {
        setTokenUpdates(prev => [...prev, {
          id: Date.now().toString(),
          tokens: data.totalTokens - (tokenUsage?.totalTokens || 0),
          cost: data.totalCost - (tokenUsage?.totalCost || 0),
          timestamp: Date.now()
        }]);

        // Remove old updates after animation
        setTimeout(() => {
          setTokenUpdates(prev => prev.filter(update => Date.now() - update.timestamp < 2000));
        }, 2000);
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
      await updateTokenUsage();
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
      await updateTokenUsage();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <p className="text-red-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
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
              <span className="px-2 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full">
                {project.language || "Unknown"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {tokenUsage && (
                <div className="text-sm text-gray-400 relative">
                  <span className="mr-4">
                    Tokens: {tokenUsage.totalTokens.toLocaleString()}
                  </span>
                  <span>
                    Cost: ${tokenUsage.totalCost.toFixed(2)}
                  </span>
                  
                  {/* Token Update Animations */}
                  <AnimatePresence>
                    {tokenUpdates.map(update => (
                      <motion.div
                        key={update.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute -top-8 right-0 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs"
                      >
                        {update.tokens > 0 && `+${update.tokens} tokens`}
                        {update.cost > 0 && ` +$${update.cost.toFixed(2)}`}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              {saving && (
                <span className="text-sm text-gray-400 flex items-center">
                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </span>
              )}
              <Button 
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
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {project.type === "shortfilm" && (
          <div className="space-y-8">
            {/* Logline */}
            <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-purple-300">Logline</h2>
                </div>
                <div className="flex space-x-2">
                  <Textarea
                    value={logline}
                    onChange={e => setLogline(e.target.value)}
                    className="bg-white/10 text-white placeholder:text-gray-400 border-white/10 min-h-[60px]"
                    placeholder="Edit your film's logline..."
                  />
                  <Button
                    onClick={saveLogline}
                    disabled={savingLogline}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {savingLogline ? (
                      <>
                        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Characters */}
            <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-purple-300">Characters</h2>
                  <Button
                    onClick={addCharacter}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Icons.book className="h-4 w-4 mr-2" />
                    Add Character
                  </Button>
                </div>
                <div className="space-y-4">
                  {characters.map((character, idx) => (
                    <div key={character.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <Input
                          value={character.name}
                          onChange={e => {
                            const updated = [...characters];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setCharacters(updated);
                          }}
                          className="bg-white/10 text-white border-white/10 font-semibold"
                          placeholder="Character name"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCharacter(character.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Icons.close className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={character.description}
                        onChange={e => {
                          const updated = [...characters];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setCharacters(updated);
                        }}
                        className="bg-white/10 text-white border-white/10 min-h-[40px]"
                        placeholder="Character description"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={() => saveCharacter(character.id, character.name, character.description)}
                          disabled={savingCharacter === character.id}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {savingCharacter === character.id ? (
                            <>
                              <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scenes */}
            <Card className="border-none bg-white/5 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-purple-300">Scenes</h2>
                  <Button
                    onClick={addScene}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Icons.film className="h-4 w-4 mr-2" />
                    Add Scene
                  </Button>
                </div>
                <div className="space-y-6">
                  {scenes.map((scene, idx) => (
                    <div key={scene.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <Input
                          value={scene.title}
                          onChange={e => {
                            const updated = [...scenes];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setScenes(updated);
                          }}
                          className="bg-white/10 text-white border-white/10 font-semibold"
                          placeholder="Scene title"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScene(scene.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Icons.close className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Collapsible Summary Section */}
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full flex justify-between items-center text-gray-400 hover:text-white"
                          onClick={() => {
                            const updated = [...scenes];
                            updated[idx] = { ...updated[idx], isSummaryExpanded: !updated[idx].isSummaryExpanded };
                            setScenes(updated);
                          }}
                        >
                          <span>Scene Summary</span>
                          <Icons.chevronDown className={`h-4 w-4 transition-transform ${scene.isSummaryExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                        {scene.isSummaryExpanded && (
                          <Textarea
                            value={scene.summary}
                            onChange={e => {
                              const updated = [...scenes];
                              updated[idx] = { ...updated[idx], summary: e.target.value };
                              setScenes(updated);
                            }}
                            className="mt-2 bg-white/10 text-white border-white/10 min-h-[40px]"
                            placeholder="Scene summary"
                          />
                        )}
                      </div>

                      {/* Script Section */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-gray-400">Script</div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => generateScript(scene.id)}
                              disabled={generatingScript === scene.id}
                            >
                              {generatingScript === scene.id ? (
                                <>
                                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Icons.plus className="h-4 w-4 mr-2" />
                                  Generate Script
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => generateStoryboard(scene.id)}
                              disabled={generatingStoryboard === scene.id || !scene.script}
                            >
                              {generatingStoryboard === scene.id ? (
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
                        <div className="relative">
                          <Textarea
                            value={scene.script || ""}
                            onChange={e => {
                              const updated = [...scenes];
                              updated[idx] = { ...updated[idx], script: e.target.value };
                              setScenes(updated);
                            }}
                            className="font-mono bg-white/10 text-white border-white/10 min-h-[400px] whitespace-pre-wrap"
                            placeholder="Scene script..."
                            style={{
                              fontFamily: 'Courier New, monospace',
                              lineHeight: '1.8',
                              tabSize: 4,
                              fontSize: '14px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Storyboard Section */}
                      <StoryboardSection
                        sceneId={scene.id}
                        script={scene.script}
                        storyboard={scene.storyboard}
                        onStoryboardUpdate={async (storyboardUrl) => {
                          const updated = [...scenes];
                          updated[idx] = { ...updated[idx], storyboard: storyboardUrl };
                          setScenes(updated);
                          await saveScene(scene.id, scene.title, scene.summary, scene.script);
                        }}
                        onGenerateStoryboard={() => generateStoryboard(scene.id)}
                        isGenerating={generatingStoryboard === scene.id}
                        onViewFullSize={(storyboardUrl) => setSelectedStoryboard(storyboardUrl)}
                      />

                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={() => saveScene(scene.id, scene.title, scene.summary, scene.script)}
                          disabled={savingScene === scene.id}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {savingScene === scene.id ? (
                            <>
                              <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
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
    </div>
  );
}