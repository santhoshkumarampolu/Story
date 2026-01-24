'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  ImageIcon, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt
} from 'lucide-react';
import Link from 'next/link';

// Simple relative time formatter
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'just now' : `${diffMins} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

interface SubscriptionData {
  subscription: {
    status: string;
    plan: string;
    planName: string;
    isActive: boolean;
    isPro: boolean;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
    lastPaymentDate: string | null;
  };
  usage: {
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
  };
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    planName: string;
    date: string;
  }>;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/subscription');
      return;
    }

    if (status === 'authenticated') {
      fetchSubscriptionData();
    }
  }, [status, router]);

  const fetchSubscriptionData = async () => {
    try {
      const res = await fetch('/api/subscription/status');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-center">Failed to load subscription data</p>
          <Button onClick={fetchSubscriptionData} className="mt-4 w-full">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const { subscription, usage, payments } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Subscription & Usage</h1>
          <p className="text-gray-400 mt-2">Manage your plan and track your usage</p>
        </div>

        {/* Current Plan Card */}
        <Card className={`mb-8 ${subscription.isPro ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {subscription.isPro ? (
                  <Crown className="h-8 w-8 text-yellow-400" />
                ) : (
                  <Zap className="h-8 w-8 text-blue-400" />
                )}
                <div>
                  <CardTitle className="text-xl text-white">{subscription.planName}</CardTitle>
                  <CardDescription>
                    {subscription.isPro ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Active Subscription
                      </span>
                    ) : (
                      <span className="text-gray-400">Free tier</span>
                    )}
                  </CardDescription>
                </div>
              </div>
              {!subscription.isPro && (
                <Link href="/pricing">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          {subscription.isPro && subscription.daysRemaining !== null && (
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">
                  {subscription.daysRemaining > 0 
                    ? `${subscription.daysRemaining} days remaining` 
                    : 'Expires today'}
                </span>
                {subscription.endDate && (
                  <span className="text-gray-500">
                    (Renews on {new Date(subscription.endDate).toLocaleDateString()})
                  </span>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Usage Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Token Usage */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-400" />
                Token Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Used this month</span>
                  <span className="text-white font-medium">
                    {usage.tokens.used.toLocaleString()} / {usage.tokens.limit.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={usage.tokens.percentage} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {usage.tokens.remaining.toLocaleString()} remaining
                  </span>
                  <span className={`font-medium ${
                    usage.tokens.percentage > 90 ? 'text-red-400' : 
                    usage.tokens.percentage > 70 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {usage.tokens.percentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Usage */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-pink-400" />
                Image Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Used this month</span>
                  <span className="text-white font-medium">
                    {usage.images.used} / {usage.images.limit}
                  </span>
                </div>
                <Progress 
                  value={usage.images.percentage} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {usage.images.remaining} remaining
                  </span>
                  <span className={`font-medium ${
                    usage.images.percentage > 90 ? 'text-red-400' : 
                    usage.images.percentage > 70 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {usage.images.percentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Reset Info */}
        {usage.resetDate && (
          <div className="bg-white/5 rounded-lg p-4 mb-8 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span className="text-gray-400 text-sm">
              Usage resets on the 1st of each month. Last reset: {new Date(usage.resetDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Payment History */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No payments yet</p>
                {!subscription.isPro && (
                  <Link href="/pricing">
                    <Button variant="link" className="text-purple-400 mt-2">
                      View pricing plans <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        payment.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {payment.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{payment.planName}</p>
                        <p className="text-gray-500 text-sm">
                          {formatRelativeTime(new Date(payment.date))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        ${(payment.amount / 100).toFixed(2)} {payment.currency}
                      </p>
                      <Badge 
                        variant={payment.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA for Free Users */}
        {!subscription.isPro && (
          <Card className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="py-8">
              <div className="text-center">
                <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Unlock Your Full Creative Potential
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Upgrade to Pro for 10x more tokens, priority support, and advanced features.
                </p>
                <Link href="/pricing">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    <Crown className="h-5 w-5 mr-2" />
                    View Pro Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
