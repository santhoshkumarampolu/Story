'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TranslationProvider, useTranslations, T } from '@/components/TranslationProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface Project {
  id: string;
  title: string;
  language: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userLanguage, setUserLanguage] = useState('English'); // Default language

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  // Rest of existing useEffect and functions...
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, toast]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]" />
      </div>
    );
  }

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case 'shortfilm':
        return 'Short Film';
      case 'short-story':
        return 'Short Story';
      case 'novel':
        return 'Novel';
      case 'screenplay':
        return 'Screenplay';
      case 'film-story':
        return 'Film Story';
      case 'synopsis':
        return 'Synopsis';
      // Legacy support
      case 'story':
        return 'Story';
      default:
        return 'Project';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'shortfilm':
        return <Icons.video className="h-5 w-5 text-[#8B5CF6]" />;
      case 'short-story':
        return <Icons.book className="h-5 w-5 text-[#8B5CF6]" />;
      case 'novel':
        return <Icons.book className="h-5 w-5 text-[#8B5CF6]" />;
      case 'screenplay':
        return <Icons.film className="h-5 w-5 text-[#8B5CF6]" />;
      case 'film-story':
        return <Icons.video className="h-5 w-5 text-[#8B5CF6]" />;
      case 'synopsis':
        return <Icons.fileText className="h-5 w-5 text-[#8B5CF6]" />;
      // Legacy support
      case 'story':
        return <Icons.book className="h-5 w-5 text-[#8B5CF6]" />;
      default:
        return <Icons.book className="h-5 w-5 text-[#8B5CF6]" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
      
      // Remove the project from the list
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
      
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  return (
    <TranslationProvider language={userLanguage} enabled={userLanguage !== 'English'}>
      <ProjectsContent
        projects={projects}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        projectToDelete={projectToDelete}
        isDeleting={isDeleting}
        handleDeleteProject={handleDeleteProject}
        openDeleteDialog={openDeleteDialog}
        getProjectTypeLabel={getProjectTypeLabel}
        getProjectTypeIcon={getProjectTypeIcon}
        formatDate={formatDate}
        userLanguage={userLanguage}
        setUserLanguage={setUserLanguage}
      />
    </TranslationProvider>
  );
}

function ProjectsContent({
  projects,
  deleteDialogOpen,
  setDeleteDialogOpen,
  projectToDelete,
  isDeleting,
  handleDeleteProject,
  openDeleteDialog,
  getProjectTypeLabel,
  getProjectTypeIcon,
  formatDate,
  userLanguage,
  setUserLanguage
}: {
  projects: Project[];
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  projectToDelete: Project | null;
  isDeleting: boolean;
  handleDeleteProject: () => Promise<void>;
  openDeleteDialog: (project: Project) => void;
  getProjectTypeLabel: (type: string) => string;
  getProjectTypeIcon: (type: string) => React.ReactNode;
  formatDate: (dateString: string) => string;
  userLanguage: string;
  setUserLanguage: (language: string) => void;
}) {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
              <T k="navigation.projects" ns="common" defaultValue="My Projects" />
            </h1>
            <p className="text-gray-400 mt-1">
              <T k="headers.manageProjects" ns="projects" defaultValue="Manage and edit your writing projects" />
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLanguage={userLanguage} onLanguageChange={setUserLanguage} />
            <Link href="/dashboard/projects/new">
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
                <Icons.book className="h-4 w-4 mr-2" />
                <T k="navigation.newProject" ns="common" defaultValue="New Project" />
              </Button>
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card className="border border-[#1F1F1F] bg-[#0A0A0A] shadow-lg">
            <CardContent className="p-8 text-center">
              <Icons.book className="h-12 w-12 mx-auto text-[#8B5CF6] mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                <T k="labels.noProjectsYet" ns="projects" defaultValue="No projects yet" />
              </h3>
              <p className="text-gray-400 mb-6">
                <T k="labels.createFirstProject" ns="projects" defaultValue="Create your first project to get started" />
              </p>
              <Link href="/dashboard/projects/new">
                <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
                  <Icons.book className="h-4 w-4 mr-2" />
                  <T k="actions.createNewProject" ns="projects" defaultValue="Create New Project" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/editor/${project.id}`}>
                  <Card className="border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#1F1F1F] transition-colors cursor-pointer relative group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getProjectTypeIcon(project.type || project.language)}
                          <span className="px-2 py-1 text-sm bg-[#1F1F1F] text-[#8B5CF6] rounded-full border border-[#2F2F2F]">
                            {getProjectTypeLabel(project.type || project.language)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-400 h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openDeleteDialog(project);
                            }}
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#8B5CF6] h-8 w-8">
                            <Icons.arrowLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                      <div className="text-sm text-gray-400">
                        <p>
                          <T k="common.lastUpdated" ns="common" defaultValue="Last updated" />: {formatDate(project.updatedAt)}
                        </p>
                        <p>
                          <T k="common.created" ns="common" defaultValue="Created" />: {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border border-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">
              <T k="actions.deleteProject" ns="projects" defaultValue="Delete Project" />
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('messages.deleteConfirm', { 
                ns: 'common', 
                defaultValue: `Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`,
                interpolation: { title: projectToDelete?.title }
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-[#1F1F1F] text-white hover:bg-[#1F1F1F]"
            >
              <T k="buttons.cancel" ns="common" defaultValue="Cancel" />
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  <T k="states.deleting" ns="common" defaultValue="Deleting..." />
                </>
              ) : (
                <>
                  <Icons.trash className="mr-2 h-4 w-4" />
                  <T k="buttons.delete" ns="common" defaultValue="Delete" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 