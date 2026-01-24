'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Crown, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

function PaymentSuccessContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch('/api/subscription/status');
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchSubscription();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const planName = subscription?.subscription?.planName || 'Premium';
  const isPro = subscription?.subscription?.status === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="pt-10 pb-8 px-8 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Payment Successful! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-8"
            >
              Welcome to {planName}! Your subscription is now active.
            </motion.p>

            {/* Plan Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
                isPro 
                  ? 'bg-purple-500/20 border border-purple-500/40' 
                  : 'bg-blue-500/20 border border-blue-500/40'
              }`}>
                {isPro ? (
                  <Crown className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Sparkles className="h-5 w-5 text-blue-400" />
                )}
                <span className="text-white font-semibold">{planName} Member</span>
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 rounded-lg p-4 mb-8 text-left"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-3">You now have access to:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  {isPro ? '100,000' : '25,000'} tokens per month
                </li>
                <li className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  {isPro ? '100' : '25'} AI image generations
                </li>
                <li className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  {isPro ? 'Unlimited' : '10'} projects
                </li>
                <li className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  {isPro ? 'Priority' : 'Email'} support
                </li>
              </ul>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/projects/new" className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Create New Project
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-gray-500 mt-6"
            >
              A receipt has been sent to your email address.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}