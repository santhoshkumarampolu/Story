'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PROJECT_CONFIGURATIONS, ProjectType } from '@/lib/project-templates';
import { Check, Clock, FileText, Film, Video, Book, Tv, Mic, Camera, Users, Target, Sparkles } from 'lucide-react';
import { TranslationProvider, useTranslations, T } from '@/components/TranslationProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface ProjectTypeOption {
  value: ProjectType;
  label: string;
  description: string;
  tagline: string;
  icon: string;
  bestFor: string[];
  targetLength: { min: number; max: number; unit: string };
}

const projectTypes: ProjectTypeOption[] = [
  {
    value: 'shortfilm',
    label: 'Short Film',
    description: 'Create a production-ready short film from concept to final screenplay with scene breakdowns',
    tagline: 'From idea to action! 🎬',
    icon: '🎬',
    bestFor: ['Film students', 'Independent filmmakers', 'Film festivals'],
    targetLength: { min: 5, max: 30, unit: 'minutes' }
  },
  {
    value: 'screenplay',
    label: 'Feature Screenplay',
    description: 'Write a professional feature-length screenplay ready for studio submission',
    tagline: 'Your feature film starts here 🎭',
    icon: '🎭',
    bestFor: ['Aspiring screenwriters', 'Film competitions', 'Spec scripts'],
    targetLength: { min: 90, max: 120, unit: 'pages' }
  },
  {
    value: 'shortstory',
    label: 'Short Story',
    description: 'Craft a literary short story with rich prose and meaningful themes for publication',
    tagline: 'Every word counts ✍️',
    icon: '📖',
    bestFor: ['Literary magazines', 'Writing contests', 'MFA portfolios'],
    targetLength: { min: 1500, max: 7500, unit: 'words' }
  },
  {
    value: 'novel',
    label: 'Novel',
    description: 'Develop a full-length novel with complex plotting and rich world-building',
    tagline: 'Your epic story awaits 📚',
    icon: '📚',
    bestFor: ['Traditional publishing', 'Self-publishing', 'NaNoWriMo'],
    targetLength: { min: 60000, max: 120000, unit: 'words' }
  },
  {
    value: 'webseries',
    label: 'Web Series',
    description: 'Create a binge-worthy web series with episodic structure and cliffhangers',
    tagline: 'Make them binge! 📺',
    icon: '📺',
    bestFor: ['YouTube creators', 'Streaming pitches', 'Digital content'],
    targetLength: { min: 6, max: 12, unit: 'episodes' }
  },
  {
    value: 'documentary',
    label: 'Documentary',
    description: 'Develop a compelling documentary with research, interviews, and narrative structure',
    tagline: 'Tell the real story 🎥',
    icon: '🎥',
    bestFor: ['Documentary filmmakers', 'Journalists', 'Grant applications'],
    targetLength: { min: 30, max: 120, unit: 'minutes' }
  },
  {
    value: 'podcast',
    label: 'Podcast Script',
    description: 'Create engaging podcast episodes with scripts, research, and show notes',
    tagline: 'Be heard 🎙️',
    icon: '🎙️',
    bestFor: ['Podcasters', 'Audio storytellers', 'Content creators'],
    targetLength: { min: 20, max: 60, unit: 'minutes' }
  }
];

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('shortfilm');
  const [isLoading, setIsLoading] = useState(false);
  const [userLanguage, setUserLanguage] = useState('English'); // Default language

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/projects/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          language: projectType
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to create project: ${errorData}`);
      }

      const { id } = await res.json();
      router.push(`/editor/${id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TranslationProvider key={userLanguage} targetLanguage={userLanguage} enabled={userLanguage !== 'English'}>
      <NewProjectContent
        title={title}
        setTitle={setTitle}
        projectType={projectType}
        setProjectType={setProjectType}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        router={router}
        userLanguage={userLanguage}
        setUserLanguage={setUserLanguage}
      />
    </TranslationProvider>
  );
}

function NewProjectContent({
  title,
  setTitle,
  projectType,
  setProjectType,
  isLoading,
  handleSubmit,
  router,
  userLanguage,
  setUserLanguage
}: {
  title: string;
  setTitle: (title: string) => void;
  projectType: ProjectType;
  setProjectType: (type: ProjectType) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  router: any;
  userLanguage: string;
  setUserLanguage: (language: string) => void;
}) {
  const { t } = useTranslations();

  const localizedProjectTypes: ProjectTypeOption[] = [
    {
      value: 'shortfilm',
      label: t('projectTypes.shortfilm', { ns: 'projects', defaultValue: 'Short Film' }),
      description: t('projectTypeDescriptions.shortfilm', { ns: 'projects', defaultValue: 'Create a production-ready short film from concept to final screenplay with scene breakdowns' }),
      tagline: 'From idea to action! 🎬',
      icon: '🎬',
      bestFor: ['Film students', 'Independent filmmakers', 'Film festivals'],
      targetLength: { min: 5, max: 30, unit: 'minutes' }
    },
    {
      value: 'screenplay',
      label: t('projectTypes.screenplay', { ns: 'projects', defaultValue: 'Feature Screenplay' }),
      description: t('projectTypeDescriptions.screenplay', { ns: 'projects', defaultValue: 'Write a professional feature-length screenplay ready for studio submission' }),
      tagline: 'Your feature film starts here 🎭',
      icon: '🎭',
      bestFor: ['Aspiring screenwriters', 'Film competitions', 'Spec scripts'],
      targetLength: { min: 90, max: 120, unit: 'pages' }
    },
    {
      value: 'shortstory',
      label: t('projectTypes.shortStory', { ns: 'projects', defaultValue: 'Short Story' }),
      description: t('projectTypeDescriptions.shortStory', { ns: 'projects', defaultValue: 'Craft a literary short story with rich prose and meaningful themes for publication' }),
      tagline: 'Every word counts ✍️',
      icon: '📖',
      bestFor: ['Literary magazines', 'Writing contests', 'MFA portfolios'],
      targetLength: { min: 1500, max: 7500, unit: 'words' }
    },
    {
      value: 'novel',
      label: t('projectTypes.novel', { ns: 'projects', defaultValue: 'Novel' }),
      description: t('projectTypeDescriptions.novel', { ns: 'projects', defaultValue: 'Develop a full-length novel with complex plotting and rich world-building' }),
      tagline: 'Your epic story awaits 📚',
      icon: '📚',
      bestFor: ['Traditional publishing', 'Self-publishing', 'NaNoWriMo'],
      targetLength: { min: 60000, max: 120000, unit: 'words' }
    },
    {
      value: 'webseries',
      label: t('projectTypes.webseries', { ns: 'projects', defaultValue: 'Web Series' }),
      description: t('projectTypeDescriptions.webseries', { ns: 'projects', defaultValue: 'Create a binge-worthy web series with episodic structure and cliffhangers' }),
      tagline: 'Make them binge! 📺',
      icon: '📺',
      bestFor: ['YouTube creators', 'Streaming pitches', 'Digital content'],
      targetLength: { min: 6, max: 12, unit: 'episodes' }
    },
    {
      value: 'documentary',
      label: t('projectTypes.documentary', { ns: 'projects', defaultValue: 'Documentary' }),
      description: t('projectTypeDescriptions.documentary', { ns: 'projects', defaultValue: 'Develop a compelling documentary with research, interviews, and narrative structure' }),
      tagline: 'Tell the real story 🎥',
      icon: '🎥',
      bestFor: ['Documentary filmmakers', 'Journalists', 'Grant applications'],
      targetLength: { min: 30, max: 120, unit: 'minutes' }
    },
    {
      value: 'podcast',
      label: t('projectTypes.podcast', { ns: 'projects', defaultValue: 'Podcast Script' }),
      description: t('projectTypeDescriptions.podcast', { ns: 'projects', defaultValue: 'Create engaging podcast episodes with scripts, research, and show notes' }),
      tagline: 'Be heard 🎙️',
      icon: '🎙️',
      bestFor: ['Podcasters', 'Audio storytellers', 'Content creators'],
      targetLength: { min: 20, max: 60, unit: 'minutes' }
    }
  ];

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'minutes': return t('labels.minuteCount', { ns: 'projects', defaultValue: 'minutes' });
      case 'pages': return t('labels.pageCount', { ns: 'projects', defaultValue: 'pages' });
      case 'words': return t('labels.wordCount', { ns: 'projects', defaultValue: 'words' });
      case 'episodes': return t('labels.episodeCount', { ns: 'projects', defaultValue: 'episodes' });
      default: return unit;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'shortfilm': return <Film className="w-4 h-4" />;
      case 'screenplay': return <Film className="w-4 h-4" />;
      case 'shortstory': return <FileText className="w-4 h-4" />;
      case 'novel': return <Book className="w-4 h-4" />;
      case 'webseries': return <Tv className="w-4 h-4" />;
      case 'documentary': return <Camera className="w-4 h-4" />;
      case 'podcast': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-3xl border-none shadow-lg bg-white/5 backdrop-blur-lg border border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <T k="headers.createProject" ns="projects" defaultValue="Create New Project" />
              </CardTitle>
              <CardDescription className="text-gray-300 mt-1">
                <T k="actions.chooseProjectType" ns="projects" defaultValue="Choose your project type and start creating" />
              </CardDescription>
            </div>
            <LanguageSwitcher currentLanguage={userLanguage} onLanguageChange={setUserLanguage} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-gray-300 text-lg font-medium flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <T k="labels.whatAreYouCreating" ns="projects" defaultValue="What are you creating?" />
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localizedProjectTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setProjectType(type.value)}
                      className={`
                        relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] group
                        ${projectType === type.value 
                          ? 'border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/20' 
                          : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                        }
                      `}
                    >
                      {projectType === type.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{type.icon}</span>
                          <div>
                            <h3 className="text-base font-semibold text-white">
                              {type.label}
                            </h3>
                            <p className="text-xs text-purple-300 italic">
                              {type.tagline}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 leading-relaxed mb-3 flex-grow">
                          {type.description}
                        </p>
                        
                        {/* Target length badge */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                          <div className="flex items-center text-xs text-gray-500">
                            {getIcon(type.value)}
                            <span className="ml-1">
                              {type.targetLength.min.toLocaleString()}-{type.targetLength.max.toLocaleString()} {getUnitLabel(type.targetLength.unit)}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-purple-400">
                            <Users className="w-3 h-3 mr-1" />
                            {type.bestFor[0]}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300 text-lg font-medium">
                  <T k="labels.projectTitle" ns="projects" defaultValue="Project Title" />
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder={t('placeholders.projectTitle', { ns: 'projects', defaultValue: 'Enter your project title...' })}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/10 text-white placeholder:text-gray-400 border-white/10 h-12 text-lg"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <T k="buttons.cancel" ns="common" defaultValue="Cancel" />
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !title.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    <T k="states.loading" ns="common" defaultValue="Creating..." />
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    <T k="buttons.create" ns="common" defaultValue="Create Project" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 