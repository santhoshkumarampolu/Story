'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Star, Users, FileText, Headphones } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';

interface SubscriptionUpgradeProps {
  currentPlan: 'free' | 'pro';
  onUpgrade?: () => void;
  onClose?: () => void;
}

export function SubscriptionUpgrade({ currentPlan, onUpgrade, onClose }: SubscriptionUpgradeProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Create Razorpay order
      const response = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro',
          amount: SUBSCRIPTION_PLANS.pro.priceInr * 100, // Razorpay expects amount in paise
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
        description: 'Pro Plan Subscription',
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
              }),
            });

            if (verifyResponse.ok) {
              toast({
                title: 'Success!',
                description: 'Your subscription has been upgraded to Pro!',
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
        prefill: {
          name: 'User Name', // You can get this from session
          email: 'user@example.com', // You can get this from session
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
      setLoading(false);
    }
  };

  const FeatureIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'tokens': return <Zap className="h-4 w-4" />;
      case 'support': return <Headphones className="h-4 w-4" />;
      case 'export': return <FileText className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Upgrade to Pro
          </h2>
          <p className="text-gray-400">
            Unlock unlimited creativity with our Pro plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <span>Free Plan</span>
                {currentPlan === 'free' && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </CardTitle>
              <div className="text-3xl font-bold">
                ₹0<span className="text-lg text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold text-red-400 mb-2">Limitations:</h4>
                <ul className="space-y-1">
                  {SUBSCRIPTION_PLANS.free.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                      <X className="h-4 w-4 text-red-400" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-purple-500/10 border-purple-500/30 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span>Pro Plan</span>
                {currentPlan === 'pro' && (
                  <Badge variant="default">Current</Badge>
                )}
              </CardTitle>
              <div className="text-3xl font-bold">
                ₹100<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-400">Just ₹3.33 per day</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold text-green-400 mb-2">Pro Benefits:</h4>
                <ul className="space-y-1">
                  {SUBSCRIPTION_PLANS.pro.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="bg-white/5 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">Plan Comparison</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="font-semibold">Feature</div>
            <div className="font-semibold text-center">Free</div>
            <div className="font-semibold text-center">Pro</div>
            
            <div>Monthly Tokens</div>
            <div className="text-center">10,000</div>
            <div className="text-center text-green-400 font-semibold">100,000</div>
            
            <div>Image Generations</div>
            <div className="text-center">10</div>
            <div className="text-center text-green-400 font-semibold">100</div>
            
            <div>Export Formats</div>
            <div className="text-center">Basic</div>
            <div className="text-center text-green-400 font-semibold">PDF, Word, Final Draft</div>
            
            <div>Support</div>
            <div className="text-center">Community</div>
            <div className="text-center text-green-400 font-semibold">Priority</div>
            
            <div>Analytics</div>
            <div className="text-center">Basic</div>
            <div className="text-center text-green-400 font-semibold">Advanced</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentPlan === 'free' ? (
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <Crown className="h-5 w-5 mr-2" />
              )}
              Upgrade to Pro - ₹100/month
            </Button>
          ) : (
            <div className="text-center">
              <Badge variant="default" className="text-lg px-4 py-2">
                <Crown className="h-4 w-4 mr-2" />
                You're already on Pro!
              </Badge>
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {currentPlan === 'free' ? 'Maybe Later' : 'Close'}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>🔒 Secure payment powered by Razorpay</p>
          <p>💳 Cancel anytime • No hidden fees</p>
          <p>🎯 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
} 