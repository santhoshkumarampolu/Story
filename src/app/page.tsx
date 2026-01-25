import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'AI Story Studio - Create Stories & Screenplays with AI',
  description: 'Transform your ideas into compelling stories with AI assistance. Write in Hindi, Telugu, Tamil & more languages. Free AI writing tool for authors and screenwriters.',
  alternates: {
    canonical: 'https://www.aistorystudio.com',
  },
};

export default function Home() {
  return <HomeClient />;
}
