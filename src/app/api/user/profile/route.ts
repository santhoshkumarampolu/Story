import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view profile" },
        { status: 401 }
      );
    }

    // Get comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        projects: {
          orderBy: { updatedAt: 'desc' },
          take: 5, // Get latest 5 projects
          select: {
            id: true,
            title: true,
            type: true,
            language: true,
            updatedAt: true,
            _count: {
              select: {
                scenes: true,
                characters: true,
              }
            }
          }
        },
        tokenUsages: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Get latest 10 token usage records
          select: {
            id: true,
            type: true,
            tokens: true,
            cost: true,
            operationName: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            projects: true,
            tokenUsages: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate usage statistics
    const totalTokensUsed = user.tokenUsages.reduce((sum, usage) => sum + usage.tokens, 0);
    const totalCost = user.tokenUsages.reduce((sum, usage) => sum + usage.cost, 0);
    
    // Get monthly usage (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyTokenUsage = await prisma.tokenUsage.aggregate({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: currentMonth
        }
      },
      _sum: {
        tokens: true,
        cost: true
      }
    });

    // Determine subscription limits
    const isPro = user.subscriptionStatus === 'pro';
    const tokenLimit = isPro ? 100000 : 10000;
    const imageLimit = isPro ? 100 : 10;
    const remainingTokens = Math.max(0, tokenLimit - user.tokenUsageThisMonth);
    const remainingImages = Math.max(0, imageLimit - user.imageUsageThisMonth);

    // Calculate usage percentage
    const tokenUsagePercentage = (user.tokenUsageThisMonth / tokenLimit) * 100;
    const imageUsagePercentage = (user.imageUsageThisMonth / imageLimit) * 100;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        subscriptionStatus: user.subscriptionStatus,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      subscription: {
        status: user.subscriptionStatus,
        isPro,
        limits: {
          tokens: tokenLimit,
          images: imageLimit,
        },
        currentUsage: {
          tokens: user.tokenUsageThisMonth,
          images: user.imageUsageThisMonth,
        },
        remaining: {
          tokens: remainingTokens,
          images: remainingImages,
        },
        usagePercentage: {
          tokens: Math.round(tokenUsagePercentage),
          images: Math.round(imageUsagePercentage),
        }
      },
      statistics: {
        totalProjects: user._count.projects,
        totalTokenOperations: user._count.tokenUsages,
        totalTokensUsed,
        totalCost,
        monthlyTokensUsed: monthlyTokenUsage._sum.tokens || 0,
        monthlyCost: monthlyTokenUsage._sum.cost || 0,
      },
      recentActivity: {
        projects: user.projects,
        tokenUsage: user.tokenUsages,
      }
    });
  } catch (error) {
    console.error("[PROFILE_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update profile" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name } = body;

    // Validate input
    if (name && typeof name === 'string' && name.trim().length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { name: name.trim() },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          updatedAt: true,
        }
      });

      return NextResponse.json(updatedUser);
    } else {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[PROFILE_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 