import { Metadata } from 'next';
import DialogueToolClient from './DialogueToolClient';

export const metadata: Metadata = {
  title: 'Free AI Dialogue Generator | Write Scripts in 6 Languages',
  description: 'Generate realistic dialogue for stories and screenplays instantly. Support for English, Hindi, Telugu, Tamil, Kannada, and Malayalam. No login required.',
  keywords: [
    'AI dialogue generator',
    'AI script writer',
    'dialogue writing tool',
    'Telugu AI writing',
    'Hindi AI script generator',
    'screenplay dialogue assistant'
  ],
  openGraph: {
    title: 'Free AI Dialogue Generator | AI Story Studio',
    description: 'Instantly generate professional dialogue for your stories and films. No account needed.',
    url: 'https://aistorystudio.com/dialogue-tool',
    type: 'website',
  }
};

export default function DialogueToolPage() {
  return <DialogueToolClient />;
}
