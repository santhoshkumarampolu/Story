'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsageData {
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
}

interface SubscriptionData {
  status: 'free' | 'hobby' | 'pro';
  plan: string;
  planName: string;
  isActive: boolean;
  isPro: boolean;
}

interface SubscriptionStatus {
  subscription: SubscriptionData;
  usage: UsageData;
}

export function useSubscriptionLimits() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'tokens' | 'images'>('tokens');

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
        setError(null);
      } else {
        setError('Failed to fetch subscription status');
      }
    } catch (err) {
      setError('Error fetching subscription status');
      console.error('Subscription status error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // Check if user can perform a token-consuming operation
  const canUseTokens = useCallback((requiredTokens: number = 1000): boolean => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.usage.tokens.remaining >= requiredTokens;
  }, [subscriptionStatus]);

  // Check if user can perform an image-consuming operation
  const canUseImages = useCallback((requiredImages: number = 1): boolean => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.usage.images.remaining >= requiredImages;
  }, [subscriptionStatus]);

  // Check limits before an AI operation - returns true if allowed, false if blocked
  const checkTokenLimit = useCallback((requiredTokens: number = 1000): boolean => {
    if (!canUseTokens(requiredTokens)) {
      setLimitModalType('tokens');
      setShowLimitModal(true);
      return false;
    }
    return true;
  }, [canUseTokens]);

  // Check limits before an image operation - returns true if allowed, false if blocked
  const checkImageLimit = useCallback((requiredImages: number = 1): boolean => {
    if (!canUseImages(requiredImages)) {
      setLimitModalType('images');
      setShowLimitModal(true);
      return false;
    }
    return true;
  }, [canUseImages]);

  // Close the limit modal
  const closeLimitModal = useCallback(() => {
    setShowLimitModal(false);
  }, []);

  // Get the current plan tier
  const currentPlan = subscriptionStatus?.subscription.status || 'free';

  // Get usage percentages
  const tokenUsagePercentage = subscriptionStatus?.usage.tokens.percentage || 0;
  const imageUsagePercentage = subscriptionStatus?.usage.images.percentage || 0;

  // Check if usage is high (above 80%)
  const isTokenUsageHigh = tokenUsagePercentage >= 80;
  const isImageUsageHigh = imageUsagePercentage >= 80;

  // Check if limits are exceeded
  const isTokenLimitExceeded = tokenUsagePercentage >= 100;
  const isImageLimitExceeded = imageUsagePercentage >= 100;

  return {
    subscriptionStatus,
    loading,
    error,
    // Check functions
    canUseTokens,
    canUseImages,
    checkTokenLimit,
    checkImageLimit,
    // Modal state
    showLimitModal,
    limitModalType,
    closeLimitModal,
    // Status helpers
    currentPlan: currentPlan as 'free' | 'hobby' | 'pro',
    tokenUsagePercentage,
    imageUsagePercentage,
    isTokenUsageHigh,
    isImageUsageHigh,
    isTokenLimitExceeded,
    isImageLimitExceeded,
    // Refresh function
    refreshStatus: fetchSubscriptionStatus,
    // Usage data shortcuts
    tokensUsed: subscriptionStatus?.usage.tokens.used || 0,
    tokensLimit: subscriptionStatus?.usage.tokens.limit || 0,
    tokensRemaining: subscriptionStatus?.usage.tokens.remaining || 0,
    imagesUsed: subscriptionStatus?.usage.images.used || 0,
    imagesLimit: subscriptionStatus?.usage.images.limit || 0,
    imagesRemaining: subscriptionStatus?.usage.images.remaining || 0,
    resetDate: subscriptionStatus?.usage.resetDate,
  };
}
