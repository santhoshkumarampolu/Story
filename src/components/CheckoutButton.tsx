'use client';

import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/usePayment';
import { Crown, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PlanKey = 'hobby_monthly' | 'hobby_yearly' | 'pro_monthly' | 'pro_yearly';

interface CheckoutButtonProps {
  planKey: PlanKey;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CheckoutButton({
  planKey,
  children,
  className,
  variant = 'default',
  size = 'default',
  disabled,
  onSuccess,
  onError,
}: CheckoutButtonProps) {
  const { initiatePayment, loading, currentPlanKey } = usePayment({
    onSuccess: () => onSuccess?.(),
    onError: (error) => onError?.(error),
  });

  const isLoading = loading && currentPlanKey === planKey;
  const isPro = planKey.startsWith('pro');

  const handleClick = async () => {
    if (disabled || loading) return;
    await initiatePayment(planKey);
  };

  const getButtonStyles = () => {
    if (isPro) {
      return variant === 'default' 
        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
        : '';
    }
    return variant === 'default' 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : '';
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    }
    return isPro 
      ? <Crown className="mr-2 h-4 w-4" />
      : <Sparkles className="mr-2 h-4 w-4" />;
  };

  const getDefaultText = () => {
    const planType = isPro ? 'Pro' : 'Hobby';
    const billing = planKey.endsWith('yearly') ? 'Yearly' : 'Monthly';
    return `Subscribe to ${planType} (${billing})`;
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(getButtonStyles(), className)}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {getIcon()}
      {children || getDefaultText()}
    </Button>
  );
}

// Shorthand components for common use cases
export function HobbyMonthlyButton(props: Omit<CheckoutButtonProps, 'planKey'>) {
  return <CheckoutButton planKey="hobby_monthly" {...props} />;
}

export function HobbyYearlyButton(props: Omit<CheckoutButtonProps, 'planKey'>) {
  return <CheckoutButton planKey="hobby_yearly" {...props} />;
}

export function ProMonthlyButton(props: Omit<CheckoutButtonProps, 'planKey'>) {
  return <CheckoutButton planKey="pro_monthly" {...props} />;
}

export function ProYearlyButton(props: Omit<CheckoutButtonProps, 'planKey'>) {
  return <CheckoutButton planKey="pro_yearly" {...props} />;
}
