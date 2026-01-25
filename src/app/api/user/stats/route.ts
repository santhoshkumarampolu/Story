import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_words', target: 100, type: 'words' },
  { id: 'getting_started', target: 1, type: 'steps' },
  { id: 'on_fire', target: 3, type: 'streak' },
  { id: 'wordsmith', target: 1000, type: 'session_words' },
  { id: 'dedicated', target: 60, type: 'session_minutes' },
  { id: 'storyteller', target: 5, type: 'steps' },
  { id: 'prolific', target: 10000, type: 'words' },
  { id: 'unstoppable', target: 7, type: 'streak' },
  { id: 'novelist', target: 50000, type: 'words' },
  { id: 'marathon', target: 10, type: 'sessions' },
  { id: 'coffee_break', target: 30, type: 'streak' },
  { id: 'master', target: 3, type: 'projects' },
];

// GET: Fetch user stats and achievements
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userStats: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create user stats
    let stats = user.userStats;
    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Get user achievements
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
    });

    // Get project count
    const projectCount = await prisma.project.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalWords: stats.totalWords,
        totalMinutes: stats.totalMinutes,
        sessionsCompleted: stats.sessionsCompleted,
        stepsCompleted: stats.stepsCompleted,
        projectsCreated: projectCount,
        projectsCompleted: stats.projectsCompleted,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastWritingDate: stats.lastWritingDate,
        averageWordsPerSession: stats.sessionsCompleted > 0 
          ? Math.round(stats.totalWords / stats.sessionsCompleted) 
          : 0,
      },
      achievements: achievements.map(a => ({
        id: a.achievementId,
        unlockedAt: a.unlockedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

// POST: Record a writing session and update stats
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { words = 0, minutes = 0, stepsCompleted = 0, projectId } = body;

    // Get or create user stats
    let stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });

    if (!stats) {
      stats = await prisma.userStats.create({
        data: { userId: user.id },
      });
    }

    // Check if user wrote today already (for streak calculation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWritingDate = stats.lastWritingDate 
      ? new Date(stats.lastWritingDate) 
      : null;
    
    if (lastWritingDate) {
      lastWritingDate.setHours(0, 0, 0, 0);
    }

    // Calculate streak
    let newStreak = stats.currentStreak;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastWritingDate) {
      // First time writing
      newStreak = 1;
    } else if (lastWritingDate.getTime() === today.getTime()) {
      // Already wrote today, keep streak
      newStreak = stats.currentStreak;
    } else if (lastWritingDate.getTime() === yesterday.getTime()) {
      // Wrote yesterday, increment streak
      newStreak = stats.currentStreak + 1;
    } else {
      // Missed days, reset streak
      newStreak = 1;
    }

    const newLongestStreak = Math.max(stats.longestStreak, newStreak);

    // Update stats
    const updatedStats = await prisma.userStats.update({
      where: { userId: user.id },
      data: {
        totalWords: stats.totalWords + words,
        totalMinutes: stats.totalMinutes + minutes,
        sessionsCompleted: stats.sessionsCompleted + (words > 0 || minutes > 0 ? 1 : 0),
        stepsCompleted: stats.stepsCompleted + stepsCompleted,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastWritingDate: new Date(),
      },
    });

    // Record the writing session
    if (words > 0 || minutes > 0) {
      await prisma.writingSession.create({
        data: {
          userId: user.id,
          projectId: projectId || null,
          words,
          minutes,
          stepsCompleted,
          date: today,
        },
      });
    }

    // Check for new achievements
    const existingAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
    });
    const unlockedIds = new Set(existingAchievements.map(a => a.achievementId));

    // Get current project count for achievement checking
    const currentProjectCount = await prisma.project.count({
      where: { userId: user.id },
    });

    const newAchievements: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      let unlocked = false;
      switch (achievement.type) {
        case 'words':
          unlocked = updatedStats.totalWords >= achievement.target;
          break;
        case 'steps':
          unlocked = updatedStats.stepsCompleted >= achievement.target;
          break;
        case 'streak':
          // Check both current and longest streak for streak achievements
          unlocked = updatedStats.currentStreak >= achievement.target || updatedStats.longestStreak >= achievement.target;
          break;
        case 'sessions':
          unlocked = updatedStats.sessionsCompleted >= achievement.target;
          break;
        case 'session_words':
          unlocked = words >= achievement.target;
          break;
        case 'session_minutes':
          unlocked = minutes >= achievement.target;
          break;
        case 'projects':
          // Check both created and completed projects
          const totalProjects = currentProjectCount + updatedStats.projectsCompleted;
          unlocked = totalProjects >= achievement.target;
          break;
      }

      if (unlocked) {
        await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: achievement.id,
          },
        });
        newAchievements.push(achievement.id);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalWords: updatedStats.totalWords,
        totalMinutes: updatedStats.totalMinutes,
        sessionsCompleted: updatedStats.sessionsCompleted,
        stepsCompleted: updatedStats.stepsCompleted,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        averageWordsPerSession: updatedStats.sessionsCompleted > 0 
          ? Math.round(updatedStats.totalWords / updatedStats.sessionsCompleted) 
          : 0,
      },
      newAchievements,
      streakUpdated: newStreak !== stats.currentStreak,
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
}
