import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - AI Story Studio',
  description: 'Get in touch with AI Story Studio. Contact us for support, feedback, or partnership inquiries.',
  alternates: {
    canonical: 'https://www.aistorystudio.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}