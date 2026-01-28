'use client';

import { Crown, Zap, Sparkles, RefreshCw, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { T } from '@/components/TranslationProvider';

interface SubscriptionStatusCardProps {
  status: 'free' | 'hobby' | 'pro' | 'admin';
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
  resetDate,
}: SubscriptionStatusCardProps) {
  const tokenPercentage = Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));
  const imagePercentage = Math.min(100, Math.round((imagesUsed / imagesLimit) * 100));

  const getPlanInfo = () => {
    switch (status) {
      case 'pro':
      case 'admin':
        return { 
          icon: <Crown className="h-4 w-4 text-yellow-400" />, 
          label: <T k="plans.pro" ns="dashboard" defaultValue="Pro Studio" />, 
          color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
        };
      case 'hobby':
        return { 
          icon: <Sparkles className="h-4 w-4 text-blue-400" />, 
          label: <T k="plans.hobby" ns="dashboard" defaultValue="Hobby Mode" />, 
          color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
        };
      default:
        return { 
          icon: <Zap className="h-4 w-4 text-gray-400" />, 
          label: <T k="plans.free" ns="dashboard" defaultValue="Free Plan" />, 
          color: 'bg-white/5 border-white/10 text-gray-400' 
        };
    }
  };

  const plan = getPlanInfo();

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 75) return 'bg-amber-500';
    return status === 'pro' || status === 'admin' ? 'bg-purple-500' : 'bg-indigo-500';
  };

  return (
    <div className={`flex flex-col lg:flex-row items-center justify-between gap-6 p-5 rounded-[24px] border ${plan.color} backdrop-blur-xl transition-all hover:border-white/20 group shadow-lg`}>
      {/* Plan Identity */}
      <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-105 transition-transform duration-500">
          {plan.icon}
        </div>
        <div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.25em] uppercase opacity-40">
              <T k="usage.accountActive" ns="dashboard" defaultValue="Account Active" />
            </span>
            <span className="text-base font-bold text-white group-hover:text-purple-300 transition-colors uppercase tracking-tight">{plan.label}</span>
          </div>
          {resetDate && (
             <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">
               <RefreshCw className="h-2.5 w-2.5" />
               <T k="usage.resetOn" ns="dashboard" defaultValue="Resets on" /> {new Date(resetDate).toLocaleDateString()}
             </div>
          )}
        </div>
      </div>

      {/* Resource Meters */}
      <div className="flex-1 flex flex-col sm:flex-row gap-8 w-full">
        {/* Tokens Usage */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
               <T k="usage.neuralTokens" ns="dashboard" defaultValue="Neural Tokens" />
             </span>
             <span className="text-[10px] font-black text-white/80">{tokenPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full ${getBarColor(tokenPercentage)} transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)`} 
              style={{ width: `${tokenPercentage}%` }} 
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
             <span className="opacity-30 uppercase">{tokensUsed.toLocaleString()} <T k="usage.used" ns="dashboard" defaultValue="Used" /></span>
             <span className="opacity-60 text-white">{(tokensLimit - tokensUsed).toLocaleString()} <T k="usage.left" ns="dashboard" defaultValue="Left" /></span>
          </div>
        </div>

        {/* Images Usage */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
               <T k="usage.aiVisualizations" ns="dashboard" defaultValue="AI Visualizations" />
             </span>
             <span className="text-[10px] font-black text-white/80">{imagePercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full ${getBarColor(imagePercentage)} transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)`} 
              style={{ width: `${imagePercentage}%` }} 
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
             <span className="opacity-30 uppercase">{imagesUsed} <T k="usage.used" ns="dashboard" defaultValue="Used" /></span>
             <span className="opacity-60 text-white">{imagesLimit - imagesUsed} <T k="usage.left" ns="dashboard" defaultValue="Left" /></span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {status !== 'pro' && status !== 'admin' && (
        <Link href="/dashboard/subscription" className="shrink-0 w-full lg:w-auto">
          <Button size="sm" className="w-full h-12 px-8 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-[11px] tracking-[0.15em] uppercase transition-all active:scale-95 shadow-2xl hover:shadow-white/10 group/btn">
            <T k="actions.upgrade" ns="dashboard" defaultValue="Upgrade to Pro" /> 
            <Rocket className="ml-2 h-3.5 w-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      )}
    </div>
  );
}
