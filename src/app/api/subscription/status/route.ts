import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  SUBSCRIPTION_PLANS, 
  getSubscriptionLimits, 
  isSubscriptionActive,
  getUserPaymentHistory,
  SubscriptionTier
} from "@/lib/subscription";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view subscription" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        lastPaymentDate: true,
        tokenUsageThisMonth: true,
        imageUsageThisMonth: true,
        usageResetDate: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isActive = isSubscriptionActive(user);
    
    // Determine the effective tier (free, hobby, or pro)
    let effectiveTier: SubscriptionTier = 'free';
    if (isActive && user.subscriptionStatus) {
      // Map subscription status to tier
      if (user.subscriptionStatus === 'pro' || user.subscriptionStatus.includes('pro')) {
        effectiveTier = 'pro';
      } else if (user.subscriptionStatus === 'hobby' || user.subscriptionStatus.includes('hobby')) {
        effectiveTier = 'hobby';
      }
    }
    
    const { tokenLimit, imageLimit, isPro, maxProjects } = getSubscriptionLimits(effectiveTier);

    // Get payment history
    const payments = await getUserPaymentHistory(session.user.id);

    // Calculate days remaining
    let daysRemaining = null;
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const now = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Get current plan details
    const planId = user.subscriptionPlan || 'free';
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.free;

    return NextResponse.json({
      success: true,
      subscription: {
        status: effectiveTier,
        plan: planId,
        planName: plan.name,
        isActive,
        isPro,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        daysRemaining,
        lastPaymentDate: user.lastPaymentDate,
        maxProjects,
      },
      usage: {
        tokens: {
          used: user.tokenUsageThisMonth,
          limit: tokenLimit,
          remaining: Math.max(0, tokenLimit - user.tokenUsageThisMonth),
          percentage: Math.min(100, Math.round((user.tokenUsageThisMonth / tokenLimit) * 100)),
        },
        images: {
          used: user.imageUsageThisMonth,
          limit: imageLimit,
          remaining: Math.max(0, imageLimit - user.imageUsageThisMonth),
          percentage: Math.min(100, Math.round((user.imageUsageThisMonth / imageLimit) * 100)),
        },
        resetDate: user.usageResetDate,
      },
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        planName: p.planName,
        date: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
