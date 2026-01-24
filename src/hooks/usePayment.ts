'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

type PlanKey = 'hobby_monthly' | 'hobby_yearly' | 'pro_monthly' | 'pro_yearly';

interface UsePaymentOptions {
  onSuccess?: (plan: PlanKey) => void;
  onError?: (error: string) => void;
  redirectOnSuccess?: string;
}

interface PaymentState {
  loading: boolean;
  error: string | null;
  currentPlanKey: PlanKey | null;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function usePayment(options: UsePaymentOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    currentPlanKey: null,
  });

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(async (planKey: PlanKey) => {
    // Check authentication
    if (status !== 'authenticated' || !session?.user) {
      router.push(`/auth/signin?callbackUrl=/pricing`);
      return { success: false, error: 'Not authenticated' };
    }

    setState({ loading: true, error: null, currentPlanKey: planKey });

    try {
      // Load Razorpay script if not loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please refresh and try again.');
      }

      const plan = SUBSCRIPTION_PLANS[planKey];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      const amount = Math.round(plan.price * 100); // Convert to cents (USD)

      // Create order
      const orderResponse = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, amount }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const order = await orderResponse.json();

      // Open Razorpay checkout
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'AI Story Studio',
          description: `${plan.name} Subscription`,
          image: '/logo.png', // Add your logo
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

              const verifyData = await verifyResponse.json();

              if (verifyResponse.ok && verifyData.success) {
                toast({
                  title: '🎉 Payment Successful!',
                  description: `Welcome to ${plan.name}! Your subscription is now active.`,
                });

                options.onSuccess?.(planKey);

                if (options.redirectOnSuccess) {
                  router.push(options.redirectOnSuccess);
                } else {
                  router.push('/payment/success');
                }

                setState({ loading: false, error: null, currentPlanKey: null });
                resolve({ success: true });
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (error: any) {
              const errorMsg = error.message || 'Payment verification failed';
              toast({
                title: 'Payment Error',
                description: errorMsg + '. Please contact support if amount was deducted.',
                variant: 'destructive',
              });
              options.onError?.(errorMsg);
              setState({ loading: false, error: errorMsg, currentPlanKey: null });
              resolve({ success: false, error: errorMsg });
            }
          },
          prefill: {
            name: session.user.name || '',
            email: session.user.email || '',
          },
          notes: {
            userId: session.user.id,
            plan: planKey,
          },
          theme: {
            color: planKey.startsWith('pro') ? '#8B5CF6' : '#3B82F6',
          },
          modal: {
            ondismiss: function () {
              setState({ loading: false, error: null, currentPlanKey: null });
              resolve({ success: false, error: 'Payment cancelled' });
            },
            confirm_close: true,
            escape: false,
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        
        razorpay.on('payment.failed', function (response: any) {
          const errorMsg = response.error?.description || 'Payment failed';
          toast({
            title: 'Payment Failed',
            description: errorMsg,
            variant: 'destructive',
          });
          options.onError?.(errorMsg);
          setState({ loading: false, error: errorMsg, currentPlanKey: null });
          resolve({ success: false, error: errorMsg });
        });

        razorpay.open();
      });
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to initiate payment';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      options.onError?.(errorMsg);
      setState({ loading: false, error: errorMsg, currentPlanKey: null });
      return { success: false, error: errorMsg };
    }
  }, [session, status, router, toast, loadRazorpayScript, options]);

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    initiatePayment,
    loading: state.loading,
    error: state.error,
    currentPlanKey: state.currentPlanKey,
    resetError,
    isAuthenticated: status === 'authenticated',
  };
}
