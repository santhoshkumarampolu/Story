import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, subscriptionStatus: true }
    });

    if (!user?.isAdmin && user?.subscriptionStatus !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get verified users (emailVerified is not null)
    const verifiedUsers = await prisma.user.count({
      where: { emailVerified: { not: null } }
    });

    // Get users by email domain
    const allUsers = await prisma.user.findMany({
      select: { email: true, emailVerified: true, createdAt: true }
    });

    const emailDomains: Record<string, number> = {};
    allUsers.forEach(u => {
      const domain = u.email.split('@')[1] || 'unknown';
      emailDomains[domain] = (emailDomains[domain] || 0) + 1;
    });

    // Sort domains by count
    const topDomains = Object.entries(emailDomains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    // Get total projects
    const totalProjects = await prisma.project.count();

    // Get projects by type
    const projectsByType = await prisma.project.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    // Get total token usage
    const tokenUsageStats = await prisma.tokenUsage.aggregate({
      _sum: {
        tokens: true,
        promptTokens: true,
        completionTokens: true,
        cost: true
      },
      _count: { id: true }
    });

    // Get token usage by type
    const tokensByType = await prisma.tokenUsage.groupBy({
      by: ['type'],
      _sum: { tokens: true },
      _count: { id: true }
    });

    // Get token usage by model
    const tokensByModel = await prisma.tokenUsage.groupBy({
      by: ['modelUsed'],
      _sum: { tokens: true },
      _count: { id: true }
    });

    // Get users created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsersLast7Days = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    // Get projects created in last 7 days
    const newProjectsLast7Days = await prisma.project.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    // Get users with Google OAuth (provider = 'google')
    const googleAuthUsers = await prisma.account.count({
      where: { provider: 'google' }
    });

    // Get users with email/password (have password set)
    const emailAuthUsers = await prisma.user.count({
      where: { password: { not: null } }
    });

    // Get subscription breakdown
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionStatus'],
      _count: { id: true }
    });

    // Get daily signups for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const dailySignups: Record<string, number> = {};
    recentUsers.forEach(u => {
      const date = u.createdAt.toISOString().split('T')[0];
      dailySignups[date] = (dailySignups[date] || 0) + 1;
    });

    // Get recent projects for last 30 days
    const recentProjects = await prisma.project.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const dailyProjects: Record<string, number> = {};
    recentProjects.forEach(p => {
      const date = p.createdAt.toISOString().split('T')[0];
      dailyProjects[date] = (dailyProjects[date] || 0) + 1;
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers,
        newLast7Days: newUsersLast7Days,
        googleAuth: googleAuthUsers,
        emailAuth: emailAuthUsers,
        topDomains,
        dailySignups: Object.entries(dailySignups).map(([date, count]) => ({ date, count }))
      },
      projects: {
        total: totalProjects,
        newLast7Days: newProjectsLast7Days,
        byType: projectsByType.map(p => ({
          type: p.type || 'unknown',
          count: p._count.id
        })),
        dailyCreations: Object.entries(dailyProjects).map(([date, count]) => ({ date, count }))
      },
      tokens: {
        total: tokenUsageStats._sum.tokens || 0,
        promptTokens: tokenUsageStats._sum.promptTokens || 0,
        completionTokens: tokenUsageStats._sum.completionTokens || 0,
        totalCost: tokenUsageStats._sum.cost || 0,
        totalOperations: tokenUsageStats._count.id,
        byType: tokensByType.map(t => ({
          type: t.type,
          tokens: t._sum.tokens || 0,
          count: t._count.id
        })),
        byModel: tokensByModel
          .filter(m => m.modelUsed)
          .map(m => ({
            model: m.modelUsed,
            tokens: m._sum.tokens || 0,
            count: m._count.id
          }))
      },
      subscriptions: subscriptionStats.map(s => ({
        status: s.subscriptionStatus || 'free',
        count: s._count.id
      }))
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
