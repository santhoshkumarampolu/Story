"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Trophy, Flame, Target, Clock, FileText, Star,
  Zap, Award, Medal, Crown, Rocket, Coffee,
  Calendar, TrendingUp, CheckCircle2, Sparkles
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

interface WritingStats {
  totalWords: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  stepsCompleted: number;
  projectsCreated: number;
  averageWordsPerSession: number;
}

interface WritingStatsTrackerProps {
  stats: WritingStats;
  onClose?: () => void;
  className?: string;
  unlockedAchievements?: string[]; // List of achievement IDs that are unlocked
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_words',
    title: 'First Words',
    description: 'Write your first 100 words',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    unlocked: false,
    target: 100
  },
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Complete your first workflow step',
    icon: CheckCircle2,
    color: 'from-green-500 to-emerald-500',
    unlocked: false,
    target: 1
  },
  {
    id: 'on_fire',
    title: 'On Fire!',
    description: 'Maintain a 3-day writing streak',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    unlocked: false,
    target: 3
  },
  {
    id: 'wordsmith',
    title: 'Wordsmith',
    description: 'Write 1,000 words in a single session',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    unlocked: false,
    target: 1000
  },
  {
    id: 'dedicated',
    title: 'Dedicated Writer',
    description: 'Write for 60 minutes in one session',
    icon: Clock,
    color: 'from-purple-500 to-pink-500',
    unlocked: false,
    target: 60
  },
  {
    id: 'storyteller',
    title: 'Storyteller',
    description: 'Complete 5 workflow steps',
    icon: Star,
    color: 'from-indigo-500 to-purple-500',
    unlocked: false,
    target: 5
  },
  {
    id: 'prolific',
    title: 'Prolific Writer',
    description: 'Write 10,000 total words',
    icon: Trophy,
    color: 'from-amber-500 to-yellow-500',
    unlocked: false,
    target: 10000
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: '7-day writing streak',
    icon: Crown,
    color: 'from-pink-500 to-rose-500',
    unlocked: false,
    target: 7
  },
  {
    id: 'novelist',
    title: 'Novelist',
    description: 'Write 50,000 words',
    icon: Medal,
    color: 'from-emerald-500 to-teal-500',
    unlocked: false,
    target: 50000
  },
  {
    id: 'marathon',
    title: 'Marathon Writer',
    description: 'Complete 10 writing sessions',
    icon: Rocket,
    color: 'from-cyan-500 to-blue-500',
    unlocked: false,
    target: 10
  },
  {
    id: 'coffee_break',
    title: 'Coffee Break',
    description: 'Write every day for 30 days',
    icon: Coffee,
    color: 'from-amber-600 to-amber-800',
    unlocked: false,
    target: 30
  },
  {
    id: 'master',
    title: 'Master Storyteller',
    description: 'Complete 3 full projects',
    icon: Award,
    color: 'from-violet-500 to-purple-600',
    unlocked: false,
    target: 3
  }
];

export default function WritingStatsTracker({
  stats,
  onClose,
  className,
  unlockedAchievements = []
}: WritingStatsTrackerProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [showNewAchievement, setShowNewAchievement] = useState<Achievement | null>(null);
  
  // Check achievements based on stats and passed unlocked list
  useEffect(() => {
    const unlockedSet = new Set(unlockedAchievements);
    const updatedAchievements = ACHIEVEMENTS.map(achievement => {
      let progress = 0;
      // Use the passed unlocked list as the source of truth
      const unlocked = unlockedSet.has(achievement.id);
      
      switch (achievement.id) {
        case 'first_words':
          progress = Math.min(stats.totalWords, achievement.target!);
          break;
        case 'getting_started':
          progress = Math.min(stats.stepsCompleted, achievement.target!);
          break;
        case 'on_fire':
          progress = Math.min(stats.currentStreak, achievement.target!);
          break;
        case 'wordsmith':
          progress = Math.min(stats.averageWordsPerSession, achievement.target!);
          break;
        case 'dedicated':
          progress = Math.min(stats.totalMinutes / stats.sessionsCompleted || 0, achievement.target!);
          break;
        case 'storyteller':
          progress = Math.min(stats.stepsCompleted, achievement.target!);
          break;
        case 'prolific':
          progress = Math.min(stats.totalWords, achievement.target!);
          break;
        case 'unstoppable':
          progress = Math.min(stats.longestStreak, achievement.target!);
          break;
        case 'novelist':
          progress = Math.min(stats.totalWords, achievement.target!);
          break;
        case 'marathon':
          progress = Math.min(stats.sessionsCompleted, achievement.target!);
          break;
        case 'master':
          progress = Math.min(stats.projectsCreated, achievement.target!);
          break;
        default:
          break;
      }
      
      return { ...achievement, progress, unlocked };
    });
    
    setAchievements(updatedAchievements);
  }, [stats, unlockedAchievements]);
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  
  return (
    <div className={cn("bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Your Writing Journey
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {unlockedCount} of {totalAchievements} achievements unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {stats.totalWords.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">total words</div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
        <StatCard
          icon={Clock}
          label="Time Writing"
          value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Steps Completed"
          value={stats.stepsCompleted.toString()}
          color="text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={Calendar}
          label="Sessions"
          value={stats.sessionsCompleted.toString()}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
        />
      </div>
      
      {/* Achievements */}
      <div className="p-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
      
      {/* New Achievement Popup */}
      <AnimatePresence>
        {showNewAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            onClick={() => setShowNewAchievement(null)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-yellow-500/30 shadow-2xl text-center max-w-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={cn(
                  "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 bg-gradient-to-br",
                  showNewAchievement.color
                )}
              >
                <showNewAchievement.icon className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                🎉 Achievement Unlocked!
              </h3>
              <p className="text-xl text-yellow-500 font-semibold mb-2">
                {showNewAchievement.title}
              </p>
              <p className="text-gray-400">
                {showNewAchievement.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className={cn("rounded-xl p-4", bgColor)}>
      <Icon className={cn("w-6 h-6 mb-2", color)} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercent = achievement.target 
    ? Math.min((achievement.progress || 0) / achievement.target * 100, 100) 
    : 0;
  
  return (
    <motion.div
      className={cn(
        "relative rounded-xl p-4 border transition-all",
        achievement.unlocked
          ? "bg-gradient-to-br " + achievement.color + " border-white/20"
          : "bg-white/5 border-white/10"
      )}
      whileHover={{ scale: 1.02 }}
    >
      {achievement.unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </motion.div>
      )}
      
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
        achievement.unlocked ? "bg-white/20" : "bg-white/5"
      )}>
        <achievement.icon className={cn(
          "w-5 h-5",
          achievement.unlocked ? "text-white" : "text-gray-500"
        )} />
      </div>
      
      <h4 className={cn(
        "font-semibold text-sm",
        achievement.unlocked ? "text-white" : "text-gray-400"
      )}>
        {achievement.title}
      </h4>
      
      <p className={cn(
        "text-xs mt-1",
        achievement.unlocked ? "text-white/70" : "text-gray-500"
      )}>
        {achievement.description}
      </p>
      
      {!achievement.unlocked && achievement.target && (
        <div className="mt-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-purple-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {achievement.progress?.toLocaleString()} / {achievement.target.toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
