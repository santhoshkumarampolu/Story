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
import { TranslationProvider, useTranslations, T } from '@/components/TranslationProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UsageLimitBanner } from '@/components/UsageLimitBanner';
import { SubscriptionStatusCard } from '@/components/SubscriptionStatusCard';

interface Project {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionStatus {
  subscription: {
    status: string;
    plan: string;
    planName: string;
    isActive: boolean;
    isPro: boolean;
    daysRemaining?: number | null;
  };
  usage: {
    tokens: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    images: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    resetDate: string | null;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLanguage, setUserLanguage] = useState('English');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects and subscription status in parallel
        const [projectsRes, subscriptionRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/subscription/status')
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json();
          setSubscriptionStatus(subscriptionData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, toast]);

  if (status === 'loading' || loading) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
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
    <TranslationProvider key={userLanguage} targetLanguage={userLanguage} enabled={userLanguage !== 'English'}>
      <DashboardContent 
        projects={projects}
        session={session}
        getProjectTypeIcon={getProjectTypeIcon}
        formatDate={formatDate}
        userLanguage={userLanguage}
        setUserLanguage={setUserLanguage}
        subscriptionStatus={subscriptionStatus}
      />
    </TranslationProvider>
  );
}

function DashboardContent({ 
  projects, 
  session, 
  getProjectTypeIcon, 
  formatDate,
  userLanguage,
  setUserLanguage,
  subscriptionStatus 
}: {
  projects: Project[];
  session: any;
  getProjectTypeIcon: (type: string) => React.ReactNode;
  formatDate: (dateString: string) => string;
  userLanguage: string;
  setUserLanguage: (language: string) => void;
  subscriptionStatus: SubscriptionStatus | null;
}) {
  const { t } = useTranslations();

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      <div className="relative">
        <div className="container max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              <T k="dashboard.title" ns="dashboard" defaultValue="Dashboard" />
            </h1>
            <p className="text-gray-400 mt-1 text-base sm:text-lg">
              <T k="dashboard.welcome" ns="dashboard" defaultValue="Welcome back" />, {session?.user?.name}
            </p>
          </div>
          <div className="flex justify-end">
            <LanguageSwitcher currentLanguage={userLanguage} onLanguageChange={setUserLanguage} />
          </div>
        </div>

        {/* Usage Limit Banner - only show if usage is above 70% */}
        {subscriptionStatus && (subscriptionStatus.usage.tokens.percentage >= 70 || subscriptionStatus.usage.images.percentage >= 70) && (
          <div className="mb-6">
            <UsageLimitBanner
              tokensUsed={subscriptionStatus.usage.tokens.used}
              tokensLimit={subscriptionStatus.usage.tokens.limit}
              imagesUsed={subscriptionStatus.usage.images.used}
              imagesLimit={subscriptionStatus.usage.images.limit}
              currentTier={subscriptionStatus.subscription.status as 'free' | 'hobby' | 'pro'}
              resetDate={subscriptionStatus.usage.resetDate ? new Date(subscriptionStatus.usage.resetDate) : undefined}
            />
          </div>
        )}

        {/* Subscription Status Card */}
        {subscriptionStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <SubscriptionStatusCard
              status={subscriptionStatus.subscription.status as 'free' | 'hobby' | 'pro'}
              tokensUsed={subscriptionStatus.usage.tokens.used}
              tokensLimit={subscriptionStatus.usage.tokens.limit}
              imagesUsed={subscriptionStatus.usage.images.used}
              imagesLimit={subscriptionStatus.usage.images.limit}
              daysRemaining={subscriptionStatus.subscription.daysRemaining}
              resetDate={subscriptionStatus.usage.resetDate ? new Date(subscriptionStatus.usage.resetDate) : undefined}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6 sm:mb-8"
        >
          <Link href="/dashboard/projects/new">
            <Button
              className="w-full h-20 sm:h-32 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-lg rounded-xl flex flex-col items-center justify-center space-y-1 sm:space-y-2"
            >
              <Icons.plus className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
              <span className="text-white font-medium text-base sm:text-lg">
                <T k="actions.newProject" ns="dashboard" defaultValue="New Project" />
              </span>
            </Button>
          </Link>

          <Link href="/dashboard/projects">
            <Button
              className="w-full h-20 sm:h-32 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-lg rounded-xl flex flex-col items-center justify-center space-y-1 sm:space-y-2"
            >
              <Icons.book className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
              <span className="text-white font-medium text-base sm:text-lg">
                <T k="actions.allProjects" ns="dashboard" defaultValue="All Projects" />
              </span>
            </Button>
          </Link>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-3 sm:p-6 border border-white/10"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
            <T k="dashboard.recentProjects" ns="dashboard" defaultValue="Recent Projects" />
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2 text-base sm:text-lg">
                  <T k="dashboard.noProjectsYet" ns="dashboard" defaultValue="No projects yet" />
                </h3>
                <p className="text-white/70 text-sm">
                  <T k="dashboard.createFirstProject" ns="dashboard" defaultValue="Create your first project to get started" />
                </p>
              </div>
            ) : (
              projects.slice(0, 3).map((project) => (
                <Link key={project.id} href={`/editor/${project.id}`}>
                  <Card className="bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {getProjectTypeIcon(project.language)}
                          <span className="px-2 py-1 text-xs sm:text-sm bg-white/10 text-purple-400 rounded-full">
                            {project.language}
                          </span>
                        </div>
                        <Icons.chevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2 truncate">
                        {project.title}
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-400">
                        <T k="dashboard.lastUpdated" ns="dashboard" defaultValue="Last updated" />: {formatDate(project.updatedAt)}
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
    </div>
  );
}