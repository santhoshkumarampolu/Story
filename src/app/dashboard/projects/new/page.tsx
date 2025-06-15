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
import { Check, Clock, FileText, Film, Video, Book } from 'lucide-react';

const projectTypes: { value: ProjectType; label: string; description: string; icon: string }[] = [
  {
    value: 'shortfilm',
    label: 'Short Film',
    description: 'Create a compelling short film from concept to screen-ready script',
    icon: '🎬'
  },
  {
    value: 'short-story',
    label: 'Short Story',
    description: 'Craft a compelling short story with rich characters and themes',
    icon: '📖'
  },
  {
    value: 'novel',
    label: 'Novel',
    description: 'Develop a full-length novel with complex plot and character development',
    icon: '📚'
  },
  {
    value: 'screenplay',
    label: 'Feature Screenplay',
    description: 'Write a full-length feature film screenplay with professional formatting',
    icon: '🎭'
  },
  {
    value: 'film-story',
    label: 'Film Story',
    description: 'Develop a story specifically crafted for film adaptation',
    icon: '🎥'
  },
  {
    value: 'synopsis',
    label: 'Synopsis',
    description: 'Create a compelling synopsis for pitching your story or screenplay',
    icon: '📋'
  }
];

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('short-story');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <Card className="w-full max-w-xl border-none shadow-lg bg-white/5 backdrop-blur-lg border border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Create New Project</CardTitle>
          <CardDescription className="text-gray-300">
            Choose your project type and give it a title
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-gray-300 text-lg font-medium">Choose Your Project Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setProjectType(type.value)}
                      className={`
                        relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
                        ${projectType === type.value 
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                          : 'border-white/10 bg-white/5 hover:border-purple-300/50 hover:bg-white/10'
                        }
                      `}
                    >
                      {projectType === type.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl flex-shrink-0 mt-1">
                          {type.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {type.label}
                          </h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {type.description}
                          </p>
                          
                          {/* Additional details based on project type */}
                          {type.value === 'shortfilm' && (
                            <div className="mt-3 flex items-center text-xs text-purple-300">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>5-30 minutes</span>
                            </div>
                          )}
                          {type.value === 'short-story' && (
                            <div className="mt-3 flex items-center text-xs text-purple-300">
                              <FileText className="w-3 h-3 mr-1" />
                              <span>1,000-7,500 words</span>
                            </div>
                          )}
                          {type.value === 'novel' && (
                            <div className="mt-3 flex items-center text-xs text-purple-300">
                              <Book className="w-3 h-3 mr-1" />
                              <span>50,000-120,000 words</span>
                            </div>
                          )}
                          {type.value === 'screenplay' && (
                            <div className="mt-3 flex items-center text-xs text-purple-300">
                              <Film className="w-3 h-3 mr-1" />
                              <span>90-120 pages</span>
                            </div>
                          )}
                          {type.value === 'film-story' && (
                            <div className="mt-3 flex items-center text-xs text-purple-300">
                              <Video className="w-3 h-3 mr-1" />
                              <span>15,000-40,000 words</span>
                            </div>
                          )}
                          {type.value === 'synopsis' && (
                            <div className="mt-3 flex items-center text-xs text-purple-300">
                              <FileText className="w-3 h-3 mr-1" />
                              <span>500-2,000 words</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300 text-lg font-medium">Project Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter your project title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/10 text-white placeholder:text-gray-400 border-white/10 h-12 text-lg"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 