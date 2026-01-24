'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap, Crown, Rocket, X, Calendar } from 'lucide-react';
import Link from 'next/link';

interface UsageLimitBannerProps {
  tokensUsed: number;
  tokensLimit: number;
  imagesUsed: number;
  imagesLimit: number;
  currentTier: 'free' | 'hobby' | 'pro' | 'admin';
  resetDate?: Date;
  onDismiss?: () => void;
}

export function UsageLimitBanner({
  tokensUsed,
  tokensLimit,
  imagesUsed,
  imagesLimit,
  currentTier,
  resetDate,
  onDismiss,
}: UsageLimitBannerProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const tokenPercentage = Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));
  const imagePercentage = Math.min(100, Math.round((imagesUsed / imagesLimit) * 100));
  
  const isTokensLow = tokenPercentage >= 80;
  const isTokensExhausted = tokenPercentage >= 100;
  const isImagesLow = imagePercentage >= 80;
  const isImagesExhausted = imagePercentage >= 100;
  
  // Don't show for admin users
  if (currentTier === 'admin') return null;
  
  // Don't show if dismissed and not exhausted
  if (dismissed && !isTokensExhausted && !isImagesExhausted) return null;
  
  // Don't show if everything is fine
  if (!isTokensLow && !isImagesLow) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const getUpgradeText = () => {
    if (currentTier === 'free') return 'Upgrade to Hobby';
    if (currentTier === 'hobby') return 'Upgrade to Pro';
    return 'View Plans';
  };

  const getUpgradeIcon = () => {
    if (currentTier === 'free') return <Rocket className="h-4 w-4" />;
    if (currentTier === 'hobby') return <Crown className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getBannerColor = () => {
    if (isTokensExhausted || isImagesExhausted) {
      return 'bg-red-500/20 border-red-500/30';
    }
    return 'bg-yellow-500/20 border-yellow-500/30';
  };

  const getTextColor = () => {
    if (isTokensExhausted || isImagesExhausted) {
      return 'text-red-400';
    }
    return 'text-yellow-400';
  };

  return (
    <div className={`${getBannerColor()} border rounded-lg p-4 mb-4 relative`}>
      {!isTokensExhausted && !isImagesExhausted && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-5 w-5 ${getTextColor()} shrink-0 mt-0.5`} />
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className={`font-semibold ${getTextColor()}`}>
              {isTokensExhausted || isImagesExhausted 
                ? 'Usage Limit Reached' 
                : 'Running Low on Usage'}
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              {isTokensExhausted 
                ? "You've used all your tokens this month. Upgrade to continue creating."
                : isImagesExhausted
                ? "You've used all your image generations. Upgrade to continue."
                : "You're running low on usage. Consider upgrading for more capacity."}
            </p>
          </div>

          {/* Usage Bars */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Tokens</span>
                <span className={tokenPercentage >= 100 ? 'text-red-400' : 'text-gray-300'}>
                  {tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={tokenPercentage} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Images</span>
                <span className={imagePercentage >= 100 ? 'text-red-400' : 'text-gray-300'}>
                  {imagesUsed} / {imagesLimit}
                </span>
              </div>
              <Progress 
                value={imagePercentage} 
                className="h-2"
              />
            </div>
          </div>

          {/* Upgrade Button */}
          {currentTier !== 'pro' && (
            <Link href="/pricing">
              <Button 
                size="sm" 
                className={currentTier === 'free' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
                }
              >
                {getUpgradeIcon()}
                <span className="ml-2">{getUpgradeText()}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal version for when user is completely blocked
export function UsageLimitModal({
  tokensUsed,
  tokensLimit,
  imagesUsed,
  imagesLimit,
  currentTier,
  onClose,
  reason = 'tokens',
}: UsageLimitBannerProps & { 
  onClose: () => void;
  reason?: 'tokens' | 'images';
}) {
  const router = useRouter();
  
  if (currentTier === 'admin') return null;

  const tokenPercentage = Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));
  const imagePercentage = Math.min(100, Math.round((imagesUsed / imagesLimit) * 100));

  const getNextPlan = () => {
    if (currentTier === 'free') return { name: 'Hobby', price: 49, color: 'blue' };
    if (currentTier === 'hobby') return { name: 'Pro', price: 99, color: 'purple' };
    return null;
  };

  const nextPlan = getNextPlan();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {reason === 'tokens' ? 'Token Limit Reached' : 'Image Limit Reached'}
          </h2>
          <p className="text-gray-400">
            {reason === 'tokens' 
              ? "You've used all your tokens for this month."
              : "You've used all your image generations for this month."}
          </p>
        </div>

        {/* Current Usage */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Tokens Used</span>
              <span className="text-red-400">{tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}</span>
            </div>
            <Progress value={tokenPercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Images Used</span>
              <span className={imagePercentage >= 100 ? 'text-red-400' : 'text-gray-300'}>
                {imagesUsed} / {imagesLimit}
              </span>
            </div>
            <Progress value={imagePercentage} className="h-2" />
          </div>
        </div>

        {/* Upgrade Option */}
        {nextPlan && (
          <div className={`bg-${nextPlan.color}-500/10 border border-${nextPlan.color}-500/30 rounded-lg p-4 mb-6`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {currentTier === 'free' ? (
                  <Rocket className="h-5 w-5 text-blue-400" />
                ) : (
                  <Crown className="h-5 w-5 text-yellow-400" />
                )}
                <span className="font-semibold text-white">{nextPlan.name} Plan</span>
              </div>
              <span className="text-white font-bold">${nextPlan.price}/mo</span>
            </div>
            <p className="text-sm text-gray-400">
              {currentTier === 'free' 
                ? 'Get 5x more tokens (25,000/mo) and 5x more images (25/mo)'
                : 'Get 4x more tokens (100,000/mo) and 4x more images (100/mo)'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20"
          >
            Maybe Later
          </Button>
          {nextPlan && (
            <Link href="/pricing" className="flex-1">
              <Button className={`w-full bg-${nextPlan.color}-600 hover:bg-${nextPlan.color}-700`}>
                {currentTier === 'free' ? (
                  <Rocket className="h-4 w-4 mr-2" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Upgrade Now
              </Button>
            </Link>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Usage resets on the 1st of each month
        </p>
      </div>
    </div>
  );
}
