'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Star, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SUBSCRIPTION_PLANS, getUpgradeSuggestion } from '@/lib/subscription-plans';

interface SubscriptionUpgradeProps {
  currentPlan: 'free' | 'hobby' | 'pro';
  onUpgrade?: () => void;
  onClose?: () => void;
}

export function SubscriptionUpgrade({ currentPlan, onUpgrade, onClose }: SubscriptionUpgradeProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = async (plan: 'hobby' | 'pro') => {
    setLoading(plan);
    try {
      const planKey = `${plan}_${billingCycle}` as 'hobby_monthly' | 'hobby_yearly' | 'pro_monthly' | 'pro_yearly';
      const selectedPlan = SUBSCRIPTION_PLANS[planKey];
      
      // Create Razorpay order
      const response = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          amount: Math.round(selectedPlan.price * 100), // Amount in cents (USD)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Story Studio',
        description: `${selectedPlan.name} Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/subscription/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey,
              }),
            });

            if (verifyResponse.ok) {
              toast({
                title: 'Success!',
                description: `Your subscription has been upgraded to ${selectedPlan.name}!`,
              });
              onUpgrade?.();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Payment verification failed. Please contact support.',
              variant: 'destructive',
            });
          }
        },
        theme: {
          color: '#8B5CF6',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const suggestion = getUpgradeSuggestion(currentPlan);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Zap className="h-5 w-5 text-gray-400" />;
      case 'hobby': return <Sparkles className="h-5 w-5 text-blue-400" />;
      case 'pro': return <Crown className="h-5 w-5 text-yellow-400" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getPrice = (plan: 'hobby' | 'pro') => {
    const planKey = `${plan}_${billingCycle}` as 'hobby_monthly' | 'hobby_yearly' | 'pro_monthly' | 'pro_yearly';
    return SUBSCRIPTION_PLANS[planKey].price;
  };

  const getMonthlyEquivalent = (plan: 'hobby' | 'pro') => {
    const planKey = `${plan}_yearly` as 'hobby_yearly' | 'pro_yearly';
    return (SUBSCRIPTION_PLANS[planKey].price / 12).toFixed(2);
  };

  const getSavings = (plan: 'hobby' | 'pro') => {
    const monthlyKey = `${plan}_monthly` as 'hobby_monthly' | 'pro_monthly';
    const yearlyKey = `${plan}_yearly` as 'hobby_yearly' | 'pro_yearly';
    const monthlyTotal = SUBSCRIPTION_PLANS[monthlyKey].price * 12;
    const yearlyPrice = SUBSCRIPTION_PLANS[yearlyKey].price;
    return (monthlyTotal - yearlyPrice).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {suggestion?.title || 'Upgrade Your Plan'}
          </h2>
          <p className="text-gray-400">
            {suggestion?.description || 'Choose the plan that fits your creative needs'}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg transition-colors relative ${
              billingCycle === 'yearly'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              Save 32%
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Free Plan */}
          <Card className={`bg-white/5 border-white/10 ${currentPlan === 'free' ? 'ring-2 ring-gray-500' : ''}`}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                {getPlanIcon('free')}
                <span>Free</span>
                {currentPlan === 'free' && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </CardTitle>
              <div className="text-3xl font-bold">
                $0<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-400">Get started for free</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-white/10">
                <ul className="space-y-1">
                  {SUBSCRIPTION_PLANS.free.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                      <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button disabled className="w-full bg-gray-600 text-gray-300 cursor-not-allowed">
                {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
              </Button>
            </CardContent>
          </Card>

          {/* Hobby Plan */}
          <Card className={`bg-blue-500/10 border-blue-500/30 ${currentPlan === 'hobby' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                {getPlanIcon('hobby')}
                <span>Hobby</span>
                {currentPlan === 'hobby' && (
                  <Badge variant="default">Current</Badge>
                )}
              </CardTitle>
              <div className="text-3xl font-bold">
                ${billingCycle === 'monthly' ? getPrice('hobby') : getMonthlyEquivalent('hobby')}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-green-400">
                  ${getPrice('hobby')}/year • Save ${getSavings('hobby')}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.hobby_monthly.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold text-blue-400 mb-2 text-sm">Benefits:</h4>
                <ul className="space-y-1">
                  {SUBSCRIPTION_PLANS.hobby_monthly.benefits?.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Sparkles className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {currentPlan === 'free' ? (
                <Button
                  onClick={() => handleUpgrade('hobby')}
                  disabled={loading !== null}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading === 'hobby' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Upgrade to Hobby
                </Button>
              ) : currentPlan === 'hobby' ? (
                <Button disabled className="w-full bg-blue-600/50 text-white cursor-not-allowed">
                  Current Plan
                </Button>
              ) : (
                <Button disabled className="w-full bg-gray-600 text-gray-300 cursor-not-allowed">
                  Downgrade
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`bg-purple-500/10 border-purple-500/30 relative ${currentPlan === 'pro' ? 'ring-2 ring-purple-500' : ''}`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Best Value
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                {getPlanIcon('pro')}
                <span>Pro</span>
                {currentPlan === 'pro' && (
                  <Badge variant="default">Current</Badge>
                )}
              </CardTitle>
              <div className="text-3xl font-bold">
                ${billingCycle === 'monthly' ? getPrice('pro') : getMonthlyEquivalent('pro')}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-green-400">
                  ${getPrice('pro')}/year • Save ${getSavings('pro')}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.pro_monthly.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold text-purple-400 mb-2 text-sm">Everything in Hobby, plus:</h4>
                <ul className="space-y-1">
                  {SUBSCRIPTION_PLANS.pro_monthly.benefits?.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {currentPlan !== 'pro' ? (
                <Button
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading !== null}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading === 'pro' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ) : (
                    <Crown className="h-4 w-4 mr-2" />
                  )}
                  Upgrade to Pro
                </Button>
              ) : (
                <Button disabled className="w-full bg-purple-600/50 text-white cursor-not-allowed">
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="bg-white/5 rounded-lg p-6 mb-8 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">Plan Comparison</h3>
          <div className="grid grid-cols-4 gap-4 text-sm min-w-[600px]">
            <div className="font-semibold">Feature</div>
            <div className="font-semibold text-center">Free</div>
            <div className="font-semibold text-center text-blue-400">Hobby</div>
            <div className="font-semibold text-center text-purple-400">Pro</div>
            
            <div>Monthly Tokens</div>
            <div className="text-center">5,000</div>
            <div className="text-center text-blue-400">25,000</div>
            <div className="text-center text-purple-400 font-semibold">100,000</div>
            
            <div>Image Generations</div>
            <div className="text-center">5</div>
            <div className="text-center text-blue-400">25</div>
            <div className="text-center text-purple-400 font-semibold">100</div>
            
            <div>Projects</div>
            <div className="text-center">3</div>
            <div className="text-center text-blue-400">10</div>
            <div className="text-center text-purple-400 font-semibold">Unlimited</div>
            
            <div>Export Formats</div>
            <div className="text-center">Basic</div>
            <div className="text-center text-blue-400">PDF, TXT</div>
            <div className="text-center text-purple-400 font-semibold">All Formats</div>
            
            <div>Support</div>
            <div className="text-center">Community</div>
            <div className="text-center text-blue-400">Email</div>
            <div className="text-center text-purple-400 font-semibold">Priority</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {currentPlan === 'pro' ? 'Close' : 'Maybe Later'}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>🔒 Secure payment powered by Razorpay</p>
          <p>💳 Cancel anytime • No hidden fees</p>
          <p>🎯 7-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
} 