import { prisma } from './prisma';
import type { User } from '@prisma/client';

export const FREE_TOKENS_PER_MONTH = 10000;
export const FREE_IMAGES_PER_MONTH = 10;
export const PRO_TOKENS_PER_MONTH = 100000;
export const PRO_IMAGES_PER_MONTH = 100;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    priceInr: 0,
    tokens: FREE_TOKENS_PER_MONTH,
    images: FREE_IMAGES_PER_MONTH,
    features: [
      '10,000 tokens per month',
      '10 image generations per month',
      'Basic AI story generation',
      'Standard support',
      'Community access'
    ],
    limitations: [
      'Limited to basic features',
      'No priority support',
      'No advanced analytics'
    ]
  },
  pro: {
    name: 'Pro Plan',
    price: 1.20, // $1.20 USD
    priceInr: 100, // ₹100 INR
    tokens: PRO_TOKENS_PER_MONTH,
    images: PRO_IMAGES_PER_MONTH,
    features: [
      '100,000 tokens per month',
      '100 image generations per month',
      'Advanced AI story generation',
      'Priority support',
      'Advanced analytics',
      'Export to multiple formats',
      'Collaboration features',
      'Early access to new features'
    ],
    benefits: [
      '10x more tokens',
      '10x more images',
      'Priority customer support',
      'Advanced project analytics',
      'Export to PDF, Word, Final Draft',
      'Team collaboration tools'
    ]
  }
};

export async function checkUserSubscriptionAndUsage(userId: string, tokensToAdd = 0, imagesToAdd = 0) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isAdmin: true,
      subscriptionStatus: true,
      tokenUsageThisMonth: true,
      imageUsageThisMonth: true,
    },
  });
  if (!user) throw new Error('User not found');

  if (user.isAdmin) return { allowed: true, user };

  let tokenLimit = FREE_TOKENS_PER_MONTH;
  let imageLimit = FREE_IMAGES_PER_MONTH;
  if (user.subscriptionStatus === 'pro') {
    tokenLimit = PRO_TOKENS_PER_MONTH;
    imageLimit = PRO_IMAGES_PER_MONTH;
  }

  if (
    user.tokenUsageThisMonth + tokensToAdd > tokenLimit ||
    user.imageUsageThisMonth + imagesToAdd > imageLimit
  ) {
    return { allowed: false, user };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      tokenUsageThisMonth: { increment: tokensToAdd },
      imageUsageThisMonth: { increment: imagesToAdd },
    },
  });

  return { allowed: true, user };
} 