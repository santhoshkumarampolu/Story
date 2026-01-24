'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCcw, MessageCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (reason) {
      case 'failed':
        return 'Your payment could not be processed. Please try again or use a different payment method.';
      case 'declined':
        return 'Your card was declined. Please check your card details or try a different card.';
      case 'timeout':
        return 'The payment session timed out. Please try again.';
      default:
        return 'Your payment was cancelled. No charges have been made to your account.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="pt-10 pb-8 px-8 text-center">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="relative mx-auto w-20 h-20">
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full">
                  <XCircle className="h-10 w-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {reason === 'failed' ? 'Payment Failed' : 'Payment Cancelled'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-8"
            >
              {getErrorMessage()}
            </motion.p>

            {/* What happened info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 rounded-lg p-4 mb-8 text-left"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-2">What you can do:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Try the payment again with the same or different card</li>
                <li>• Check if your card has sufficient balance</li>
                <li>• Ensure your card is enabled for online payments</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <Link href="/pricing">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>

              <Link href="/contact">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
            </motion.div>

            {/* Support Notice */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-gray-500 mt-6"
            >
              If you believe this is an error or amount was deducted, please contact our support team.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}
