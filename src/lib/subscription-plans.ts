// Client-safe subscription constants - no server-side imports
// This file can be imported in client components safely

// Token and image limits per tier
export const FREE_TOKENS_PER_MONTH = 5000;
export const FREE_IMAGES_PER_MONTH = 5;
export const HOBBY_TOKENS_PER_MONTH = 25000;
export const HOBBY_IMAGES_PER_MONTH = 25;
export const PRO_TOKENS_PER_MONTH = 100000;
export const PRO_IMAGES_PER_MONTH = 100;

export type SubscriptionTier = 'free' | 'hobby' | 'pro' | 'admin';

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with AI storytelling',
    price: 0,
    tokens: FREE_TOKENS_PER_MONTH,
    images: FREE_IMAGES_PER_MONTH,
    color: 'gray',
    features: [
      '5,000 tokens per month',
      '5 image generations per month',
      'Basic AI story generation',
      '3 projects limit',
      'Community support',
    ],
    limitations: [
      'Limited projects',
      'Basic export only',
      'No priority support',
    ]
  },
  hobby: {
    id: 'hobby',
    name: 'Hobby',
    description: 'For passionate storytellers',
    price: 4.99,
    tokens: HOBBY_TOKENS_PER_MONTH,
    images: HOBBY_IMAGES_PER_MONTH,
    color: 'blue',
    features: [
      '25,000 tokens per month',
      '25 image generations per month',
      'Advanced AI story generation',
      '10 projects limit',
      'Email support',
      'PDF export',
    ],
    benefits: [
      '5x more tokens than Free',
      '5x more images',
      'Unlimited revisions',
      'Character development tools',
    ]
  },
  hobby_monthly: {
    id: 'hobby_monthly',
    name: 'Hobby (Monthly)',
    description: 'For passionate storytellers',
    price: 4.99,
    tokens: HOBBY_TOKENS_PER_MONTH,
    images: HOBBY_IMAGES_PER_MONTH,
    billingPeriod: 'monthly' as const,
    color: 'blue',
    features: [
      '25,000 tokens per month',
      '25 image generations per month',
      'Advanced AI story generation',
      '10 projects limit',
      'Email support',
      'PDF export',
    ],
    benefits: [
      '5x more tokens than Free',
      '5x more images',
      'Unlimited revisions',
      'Character development tools',
    ]
  },
  hobby_yearly: {
    id: 'hobby_yearly',
    name: 'Hobby (Yearly)',
    description: 'For passionate storytellers',
    price: 39.99,
    tokens: HOBBY_TOKENS_PER_MONTH,
    images: HOBBY_IMAGES_PER_MONTH,
    billingPeriod: 'yearly' as const,
    color: 'blue',
    features: [
      '25,000 tokens per month',
      '25 image generations per month',
      'Advanced AI story generation',
      '10 projects limit',
      'Email support',
      'PDF export',
    ],
    benefits: [
      '2 months FREE',
      '5x more tokens than Free',
      '5x more images',
      'Unlimited revisions',
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious creators & professionals',
    price: 9.99,
    tokens: PRO_TOKENS_PER_MONTH,
    images: PRO_IMAGES_PER_MONTH,
    color: 'purple',
    features: [
      '100,000 tokens per month',
      '100 image generations per month',
      'Premium AI models',
      'Unlimited projects',
      'Priority support',
      'All export formats',
      'API access',
      'Early access to features',
    ],
    benefits: [
      '20x more tokens than Free',
      '20x more images',
      'Priority customer support',
      'Advanced analytics',
      'Export to PDF, Word, Final Draft',
      'Collaboration tools',
    ]
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro (Monthly)',
    description: 'For serious creators & professionals',
    price: 9.99,
    tokens: PRO_TOKENS_PER_MONTH,
    images: PRO_IMAGES_PER_MONTH,
    billingPeriod: 'monthly' as const,
    color: 'purple',
    features: [
      '100,000 tokens per month',
      '100 image generations per month',
      'Premium AI models',
      'Unlimited projects',
      'Priority support',
      'All export formats',
      'API access',
      'Early access to features',
    ],
    benefits: [
      '20x more tokens than Free',
      '20x more images',
      'Priority customer support',
      'Advanced analytics',
    ]
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro (Yearly)',
    description: 'For serious creators & professionals',
    price: 79.99,
    tokens: PRO_TOKENS_PER_MONTH,
    images: PRO_IMAGES_PER_MONTH,
    billingPeriod: 'yearly' as const,
    color: 'purple',
    features: [
      '100,000 tokens per month',
      '100 image generations per month',
      'Premium AI models',
      'Unlimited projects',
      'Priority support',
      'All export formats',
      'API access',
      'Early access to features',
    ],
    benefits: [
      '2 months FREE',
      '20x more tokens than Free',
      '20x more images',
      'Priority customer support',
    ]
  },
} as const;

// Helper functions safe for client-side use
export function getSubscriptionLimits(subscriptionStatus: string | null) {
  const status = subscriptionStatus || 'free';
  
  let tokenLimit = FREE_TOKENS_PER_MONTH;
  let imageLimit = FREE_IMAGES_PER_MONTH;
  let maxProjects = 3;
  let tier: SubscriptionTier = 'free';
  
  if (status === 'admin') {
    tokenLimit = Infinity;
    imageLimit = Infinity;
    maxProjects = Infinity;
    tier = 'admin';
  } else if (status === 'pro') {
    tokenLimit = PRO_TOKENS_PER_MONTH;
    imageLimit = PRO_IMAGES_PER_MONTH;
    maxProjects = Infinity;
    tier = 'pro';
  } else if (status === 'hobby') {
    tokenLimit = HOBBY_TOKENS_PER_MONTH;
    imageLimit = HOBBY_IMAGES_PER_MONTH;
    maxProjects = 10;
    tier = 'hobby';
  }
  
  return {
    tokenLimit,
    imageLimit,
    maxProjects,
    tier,
    isPro: tier === 'pro' || tier === 'admin',
    isHobby: tier === 'hobby',
    isPaid: tier !== 'free',
  };
}

export function getUpgradeSuggestion(currentTier: SubscriptionTier): { 
  suggestedPlan: string; 
  reason: string;
  planKey: string;
  title: string;
  description: string;
} | null {
  switch (currentTier) {
    case 'free':
      return {
        suggestedPlan: 'Hobby',
        reason: 'Get 5x more tokens and images',
        planKey: 'hobby_monthly',
        title: 'Upgrade to Hobby',
        description: 'Unlock 25,000 tokens and 25 images per month for passionate storytellers',
      };
    case 'hobby':
      return {
        suggestedPlan: 'Pro',
        reason: 'Get 4x more tokens and unlimited projects',
        planKey: 'pro_monthly',
        title: 'Upgrade to Pro',
        description: 'Get 100,000 tokens, 100 images and unlimited projects for professional creators',
      };
    default:
      return null;
  }
}
