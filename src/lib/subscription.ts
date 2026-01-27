import { prisma } from './prisma';
import type { User } from '@prisma/client';

// Re-export all client-safe constants from the plans file
export {
  FREE_TOKENS_PER_MONTH,
  FREE_IMAGES_PER_MONTH,
  HOBBY_TOKENS_PER_MONTH,
  HOBBY_IMAGES_PER_MONTH,
  PRO_TOKENS_PER_MONTH,
  PRO_IMAGES_PER_MONTH,
  SUBSCRIPTION_PLANS,
  getSubscriptionLimits,
  getUpgradeSuggestion,
  type SubscriptionTier,
} from './subscription-plans';

import {
  FREE_TOKENS_PER_MONTH,
  FREE_IMAGES_PER_MONTH,
  HOBBY_TOKENS_PER_MONTH,
  HOBBY_IMAGES_PER_MONTH,
  PRO_TOKENS_PER_MONTH,
  PRO_IMAGES_PER_MONTH,
  SUBSCRIPTION_PLANS,
  getSubscriptionLimits,
  type SubscriptionTier,
} from './subscription-plans';

// Legacy exports for backwards compatibility
export const FREE_IMAGES_PER_MONTH_LEGACY = FREE_IMAGES_PER_MONTH;

// Helper to check if subscription is active
export function isSubscriptionActive(user: {
  subscriptionStatus?: string | null;
  subscriptionEndDate?: Date | null;
}): boolean {
  if (!user.subscriptionStatus || user.subscriptionStatus === 'free') {
    return false;
  }
  
  // Admin users are always active
  if (user.subscriptionStatus === 'admin') {
    return true;
  }
  
  // Check if subscription hasn't expired
  if (user.subscriptionEndDate) {
    return new Date(user.subscriptionEndDate) > new Date();
  }
  
  // Hobby or Pro status without end date (legacy or lifetime)
  return user.subscriptionStatus === 'hobby' || user.subscriptionStatus === 'pro';
}

// Check if monthly usage should be reset
export function shouldResetMonthlyUsage(usageResetDate: Date | null): boolean {
  if (!usageResetDate) return true;
  
  const now = new Date();
  const resetDate = new Date(usageResetDate);
  
  // Check if we're in a new month
  return (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  );
}

export async function checkUserSubscriptionAndUsage(userId: string, tokensToAdd = 0, imagesToAdd = 0) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isAdmin: true,
      subscriptionStatus: true,
      subscriptionEndDate: true,
      tokenUsageThisMonth: true,
      imageUsageThisMonth: true,
      usageResetDate: true,
    },
  });
  if (!user) throw new Error('User not found');

  // Specific admin email has unlimited access
  const isSuperAdmin = user.email === 'santhoshkumarampolu@gmail.com' || user.isAdmin;

  // Admin users have unlimited access
  if (isSuperAdmin) return { allowed: true, user, tokensRemaining: Infinity, imagesRemaining: Infinity };

  // Check if monthly usage should be reset
  if (shouldResetMonthlyUsage(user.usageResetDate)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenUsageThisMonth: 0,
        imageUsageThisMonth: 0,
        usageResetDate: new Date(),
      },
    });
    // Update local user object
    user.tokenUsageThisMonth = 0;
    user.imageUsageThisMonth = 0;
  }

  // Check if pro subscription is still active
  const isActive = isSubscriptionActive(user);
  const effectiveStatus = isActive ? user.subscriptionStatus : 'free';
  
  const { tokenLimit, imageLimit } = getSubscriptionLimits(effectiveStatus);

  const tokensRemaining = tokenLimit - user.tokenUsageThisMonth;
  const imagesRemaining = imageLimit - user.imageUsageThisMonth;

  if (
    user.tokenUsageThisMonth + tokensToAdd > tokenLimit ||
    user.imageUsageThisMonth + imagesToAdd > imageLimit
  ) {
    return { 
      allowed: false, 
      user, 
      tokensRemaining: Math.max(0, tokensRemaining),
      imagesRemaining: Math.max(0, imagesRemaining),
      tokenLimit,
      imageLimit,
    };
  }

  // Update usage
  if (tokensToAdd > 0 || imagesToAdd > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenUsageThisMonth: { increment: tokensToAdd },
        imageUsageThisMonth: { increment: imagesToAdd },
      },
    });
  }

  return { 
    allowed: true, 
    user,
    tokensRemaining: Math.max(0, tokensRemaining - tokensToAdd),
    imagesRemaining: Math.max(0, imagesRemaining - imagesToAdd),
    tokenLimit,
    imageLimit,
  };
}

// Upgrade user subscription
export async function upgradeUserSubscription(
  userId: string, 
  planId: 'hobby_monthly' | 'hobby_yearly' | 'pro_monthly' | 'pro_yearly',
  paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
  }
) {
  const plan = SUBSCRIPTION_PLANS[planId];
  const now = new Date();
  
  // Determine subscription status based on plan
  const subscriptionStatus = planId.startsWith('pro') ? 'pro' : 'hobby';
  
  // Calculate end date based on plan
  const endDate = new Date(now);
  if (planId.endsWith('_yearly')) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  // Create payment record and update user in transaction
  const result = await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId,
        amount: paymentDetails.amount,
        currency: 'USD',
        status: 'completed',
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature,
        planId: planId,
        planName: plan.name,
        billingPeriod: (plan as any).billingPeriod || 'monthly',
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus,
        subscriptionPlan: planId,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        lastPaymentDate: now,
        // Reset monthly usage for new subscription
        tokenUsageThisMonth: 0,
        imageUsageThisMonth: 0,
        usageResetDate: now,
      },
    }),
  ]);

  return {
    payment: result[0],
    user: result[1],
  };
}

// Legacy alias for backwards compatibility
export const upgradeUserToPro = upgradeUserSubscription;

// Get user's payment history
export async function getUserPaymentHistory(userId: string) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

// Cancel subscription (mark for cancellation at period end)
export async function cancelSubscription(userId: string) {
  // We don't immediately remove pro status, just mark it to not renew
  // The actual downgrade happens when subscriptionEndDate passes
  return prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: 'cancelled', // Mark as cancelled but keep pro until end date
    },
  });
} 