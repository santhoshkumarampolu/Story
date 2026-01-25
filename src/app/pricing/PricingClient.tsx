'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Star, Sparkles, Shield, Clock, MessageCircle, Rocket } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type BillingCycle = 'monthly' | 'yearly';
type CurrentPlan = 'free' | 'hobby' | 'pro';

export default function PricingClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan>('free');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          const status = data.subscription?.status;
          if (status === 'pro') setCurrentPlan('pro');
          else if (status === 'hobby') setCurrentPlan('hobby');
          else setCurrentPlan('free');
        })
        .catch(console.error);
    }
  }, [session]);

  const handleUpgrade = async (planType: 'hobby' | 'pro', billing: BillingCycle) => {
    if (status !== 'authenticated') {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    const planKey = `${planType}_${billing}` as keyof typeof SUBSCRIPTION_PLANS;
    const plan = SUBSCRIPTION_PLANS[planKey];
    
    setLoading(planKey);
    try {
      const amount = Math.round(plan.price * 100); // Convert to cents (USD)

      const response = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          amount: amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Story Studio',
        description: `${plan.name} Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
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
                title: '🎉 Welcome!',
                description: `Your ${plan.name} subscription is now active!`,
              });
              setCurrentPlan(planType);
              router.push('/dashboard');
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
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: planType === 'pro' ? '#8B5CF6' : '#3B82F6',
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const hobbyPlan = SUBSCRIPTION_PLANS.hobby;
  const proPlan = SUBSCRIPTION_PLANS.pro;
  
  const hobbyMonthly = SUBSCRIPTION_PLANS.hobby_monthly;
  const hobbyYearly = SUBSCRIPTION_PLANS.hobby_yearly;
  const proMonthly = SUBSCRIPTION_PLANS.pro_monthly;
  const proYearly = SUBSCRIPTION_PLANS.pro_yearly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            AI Story Studio
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/20">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline" className="border-white/20">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Creative Journey
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 rounded-full p-1 flex items-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                2 months free
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="bg-white/5 border-white/10 relative overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-gray-400" />
              </div>
              <CardTitle className="text-xl text-white">Free</CardTitle>
              <CardDescription className="text-gray-400">
                Get started with AI storytelling
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentPlan === 'free' ? (
                <Button variant="outline" className="w-full border-white/20" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" className="w-full border-white/20" disabled>
                  Included
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Hobby Plan */}
          <Card className="bg-blue-500/10 border-blue-500/30 relative overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-xl text-white">Hobby</CardTitle>
              <CardDescription className="text-gray-400">
                For passionate storytellers
              </CardDescription>
              <div className="mt-4">
                {billingCycle === 'yearly' ? (
                  <>
                    <span className="text-4xl font-bold text-white">${(hobbyYearly.price / 12).toFixed(2)}</span>
                    <span className="text-gray-400">/month</span>
                    <p className="text-sm text-blue-400 mt-1">
                      ${hobbyYearly.price}/year (Save ${(hobbyMonthly.price * 12 - hobbyYearly.price).toFixed(2)})
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">${hobbyMonthly.price}</span>
                    <span className="text-gray-400">/month</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {hobbyPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentPlan === 'hobby' ? (
                <Button className="w-full bg-blue-600" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  Current Plan
                </Button>
              ) : currentPlan === 'pro' ? (
                <Button variant="outline" className="w-full border-white/20" disabled>
                  Included in Pro
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade('hobby', billingCycle)}
                  disabled={loading === `hobby_${billingCycle}`}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading === `hobby_${billingCycle}` ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Get Hobby
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="bg-yellow-500 text-yellow-900 rounded-none rounded-bl-lg px-4 py-1">
                <Star className="h-3 w-3 mr-1 inline" />
                Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
              <CardTitle className="text-xl text-white">Pro</CardTitle>
              <CardDescription className="text-gray-400">
                For serious creators
              </CardDescription>
              <div className="mt-4">
                {billingCycle === 'yearly' ? (
                  <>
                    <span className="text-4xl font-bold text-white">${(proYearly.price / 12).toFixed(2)}</span>
                    <span className="text-gray-400">/month</span>
                    <p className="text-sm text-purple-400 mt-1">
                      ${proYearly.price}/year (Save ${(proMonthly.price * 12 - proYearly.price).toFixed(2)})
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">${proMonthly.price}</span>
                    <span className="text-gray-400">/month</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {proPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentPlan === 'pro' ? (
                <Button className="w-full bg-purple-600" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade('pro', billingCycle)}
                  disabled={loading === `pro_${billingCycle}`}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading === `pro_${billingCycle}` ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Get Pro
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Compare Plans
          </h2>
          <div className="bg-white/5 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Free</th>
                  <th className="text-center p-4 text-blue-400 font-medium">Hobby</th>
                  <th className="text-center p-4 text-purple-400 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="p-4 text-gray-300">Monthly Tokens</td>
                  <td className="p-4 text-center text-gray-400">5,000</td>
                  <td className="p-4 text-center text-blue-400">25,000</td>
                  <td className="p-4 text-center text-purple-400 font-semibold">100,000</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-gray-300">Image Generations</td>
                  <td className="p-4 text-center text-gray-400">5</td>
                  <td className="p-4 text-center text-blue-400">25</td>
                  <td className="p-4 text-center text-purple-400 font-semibold">100</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-gray-300">Projects</td>
                  <td className="p-4 text-center text-gray-400">3</td>
                  <td className="p-4 text-center text-blue-400">10</td>
                  <td className="p-4 text-center text-purple-400 font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-gray-300">Export Formats</td>
                  <td className="p-4 text-center text-gray-400">Basic</td>
                  <td className="p-4 text-center text-blue-400">PDF</td>
                  <td className="p-4 text-center text-purple-400 font-semibold">All formats</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-gray-300">Support</td>
                  <td className="p-4 text-center text-gray-400">Community</td>
                  <td className="p-4 text-center text-blue-400">Email</td>
                  <td className="p-4 text-center text-purple-400 font-semibold">Priority</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-gray-300">AI Models</td>
                  <td className="p-4 text-center text-gray-400">Standard</td>
                  <td className="p-4 text-center text-blue-400">Advanced</td>
                  <td className="p-4 text-center text-purple-400 font-semibold">Premium</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-300">API Access</td>
                  <td className="p-4 text-center"><X className="h-4 w-4 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-4 w-4 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-4 w-4 text-purple-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 rounded-lg p-6">
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-400">
                Powered by Razorpay with bank-grade security
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Cancel Anytime</h3>
              <p className="text-sm text-gray-400">
                No lock-in. Cancel your subscription whenever you want
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <MessageCircle className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Instant Activation</h3>
              <p className="text-sm text-gray-400">
                Your plan activates immediately after payment
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-2">What happens when I run out of tokens?</h3>
              <p className="text-gray-400">
                You'll see a notification and won't be able to generate new content until your next billing cycle. 
                You can upgrade your plan anytime to get more tokens instantly.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-400">
                Yes! You can upgrade anytime and your new limits apply immediately. 
                Downgrades take effect at the end of your current billing period.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-2">Is there a refund policy?</h3>
              <p className="text-gray-400">
                Yes, we offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 AI Story Studio. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
