import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'AI Story Studio - Create Stories & Screenplays with AI',
  description: 'Transform your ideas into compelling stories with AI. Write in English, Hindi, Spanish, French, German & major Indian languages. Global AI writing tool for authors and screenwriters.',
  alternates: {
    canonical: 'https://www.aistorystudio.com',
  },
};

export default function Home() {
  return <HomeClient />;
}
