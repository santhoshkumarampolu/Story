"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Map, List, Sparkles } from 'lucide-react';

interface EditorModeToggleProps {
  mode: 'classic' | 'journey';
  onModeChange: (mode: 'classic' | 'journey') => void;
  className?: string;
}

export default function EditorModeToggle({
  mode,
  onModeChange,
  className
}: EditorModeToggleProps) {
  return (
    <div className={cn("relative flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10", className)}>
      {/* Background slider */}
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-2px)] bg-gradient-to-r from-purple-600 to-pink-600 rounded-md"
        animate={{
          x: mode === 'classic' ? 2 : 'calc(100% + 2px)'
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      <button
        onClick={() => onModeChange('classic')}
        className={cn(
          "relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          mode === 'classic' ? "text-white" : "text-gray-400 hover:text-white"
        )}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Classic</span>
      </button>
      
      <button
        onClick={() => onModeChange('journey')}
        className={cn(
          "relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          mode === 'journey' ? "text-white" : "text-gray-400 hover:text-white"
        )}
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Journey</span>
      </button>
    </div>
  );
}
