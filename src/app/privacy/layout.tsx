import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - AI Story Studio',
  description: 'Read our privacy policy to understand how AI Story Studio collects, uses, and protects your data.',
  alternates: {
    canonical: 'https://www.aistorystudio.com/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}