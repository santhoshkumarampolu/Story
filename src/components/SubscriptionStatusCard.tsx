'use client';

import { Crown, Zap, Sparkles, Calendar, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SubscriptionStatusCardProps {
  status: 'free' | 'hobby' | 'pro';
  tokensUsed: number;
  tokensLimit: number;
  imagesUsed: number;
  imagesLimit: number;
  daysRemaining?: number | null;
  resetDate?: Date;
}

export function SubscriptionStatusCard({
  status,
  tokensUsed,
  tokensLimit,
  imagesUsed,
  imagesLimit,
  daysRemaining,
  resetDate,
}: SubscriptionStatusCardProps) {
  const tokenPercentage = Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));
  const imagePercentage = Math.min(100, Math.round((imagesUsed / imagesLimit) * 100));

  const getPlanIcon = () => {
    switch (status) {
      case 'pro':
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 'hobby':
        return <Sparkles className="h-5 w-5 text-blue-400" />;
      default:
        return <Zap className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPlanColor = () => {
    switch (status) {
      case 'pro':
        return 'bg-purple-500/20 border-purple-500/40';
      case 'hobby':
        return 'bg-blue-500/20 border-blue-500/40';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  const getPlanName = () => {
    switch (status) {
      case 'pro':
        return 'Pro';
      case 'hobby':
        return 'Hobby';
      default:
        return 'Free';
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  return (
    <Card className={`${getPlanColor()} backdrop-blur-lg`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            {getPlanIcon()}
            <span>{getPlanName()} Plan</span>
          </CardTitle>
          {status !== 'pro' && (
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Usage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Tokens
            </span>
            <span className="text-white">
              {tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(tokenPercentage)} transition-all duration-300`}
              style={{ width: `${tokenPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(tokensLimit - tokensUsed).toLocaleString()} remaining
          </p>
        </div>

        {/* Image Usage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Images
            </span>
            <span className="text-white">
              {imagesUsed} / {imagesLimit}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(imagePercentage)} transition-all duration-300`}
              style={{ width: `${imagePercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {imagesLimit - imagesUsed} remaining
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          {daysRemaining !== undefined && daysRemaining !== null && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysRemaining} days left
            </span>
          )}
          {resetDate && (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Resets {new Date(resetDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
