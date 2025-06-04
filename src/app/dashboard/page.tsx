'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'shortfilm':
        return <Icons.video className="h-5 w-5 text-purple-500" />;
      case 'story':
        return <Icons.book className="h-5 w-5 text-purple-500" />;
      case 'screenplay':
        return <Icons.film className="h-5 w-5 text-purple-500" />;
      default:
        return <Icons.book className="h-5 w-5 text-purple-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {session?.user?.name}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <Link href="/dashboard/projects/new">
            <Button
              className="w-full h-32 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-lg rounded-xl flex flex-col items-center justify-center space-y-2"
            >
              <Icons.plus className="w-8 h-8 text-purple-500" />
              <span className="text-white font-medium">New Project</span>
            </Button>
          </Link>

          <Link href="/dashboard/projects">
            <Button
              className="w-full h-32 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-lg rounded-xl flex flex-col items-center justify-center space-y-2"
            >
              <Icons.book className="w-8 h-8 text-purple-500" />
              <span className="text-white font-medium">All Projects</span>
            </Button>
          </Link>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-4">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2">No projects yet</h3>
                <p className="text-white/70 text-sm">
                  Create your first project to get started
                </p>
              </div>
            ) : (
              projects.slice(0, 3).map((project) => (
                <Link key={project.id} href={`/editor/${project.id}`}>
                  <Card className="bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getProjectTypeIcon(project.language)}
                          <span className="px-2 py-1 text-sm bg-white/10 text-purple-400 rounded-full">
                            {project.language}
                          </span>
                        </div>
                        <Icons.chevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                      <div className="text-sm text-gray-400">
                        <p>Last updated: {formatDate(project.updatedAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}