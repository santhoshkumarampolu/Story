import { prisma } from './prisma';
import type { User } from '@prisma/client';

export const FREE_TOKENS_PER_MONTH = 10000;
export const FREE_IMAGES_PER_MONTH = 10;
export const PRO_TOKENS_PER_MONTH = 100000;
export const PRO_IMAGES_PER_MONTH = 100;

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