import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - AI Story Studio',
  description: 'Review the terms of service for using AI Story Studio. Understand our user agreement and policies.',
  alternates: {
    canonical: 'https://www.aistorystudio.com/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}