import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - AI Story Studio',
  description: 'Choose the perfect plan for your creative writing needs. Free and Pro subscriptions available.',
  alternates: {
    canonical: 'https://www.aistorystudio.com/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}