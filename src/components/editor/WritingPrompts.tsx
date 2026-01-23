"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Lightbulb, Shuffle, Heart, Skull, Laugh, 
  Sparkles, Brain, Compass, Drama, Swords,
  Eye, Clock, Globe, Users, Zap, Copy, Check,
  ChevronRight, RefreshCw
} from 'lucide-react';

interface WritingPromptsProps {
  projectType?: string;
  currentStep?: string;
  onUsePrompt?: (prompt: string) => void;
  className?: string;
}

type PromptCategory = 'conflict' | 'character' | 'setting' | 'emotion' | 'twist' | 'dialogue';

interface PromptSet {
  category: PromptCategory;
  icon: any;
  color: string;
  prompts: string[];
}

const PROMPT_CATEGORIES: PromptSet[] = [
  {
    category: 'conflict',
    icon: Swords,
    color: 'from-red-500 to-orange-500',
    prompts: [
      "What if your protagonist discovers their mentor has been lying to them all along?",
      "Your character must choose between saving their loved one or saving many strangers.",
      "The thing your character fears most becomes the only way to achieve their goal.",
      "Two characters who were allies realize they want the same thing - and only one can have it.",
      "Your character's greatest strength becomes their biggest obstacle.",
      "A secret from the past threatens to destroy everything the character has built.",
      "The character's trusted friend is revealed to be working against them.",
      "An impossible deadline forces your character to make a desperate choice."
    ]
  },
  {
    category: 'character',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    prompts: [
      "Give your character a habit they developed from a childhood trauma.",
      "What does your character do when they think no one is watching?",
      "Your character has one thing they've never told anyone. What is it?",
      "How does your character react when someone betrays their trust?",
      "What would make your character break their strongest moral code?",
      "Give your character an unexpected skill that comes from their past.",
      "What does your character's living space reveal about them?",
      "How does your character handle failure versus success?"
    ]
  },
  {
    category: 'setting',
    icon: Globe,
    color: 'from-green-500 to-emerald-500',
    prompts: [
      "What if this scene takes place during a natural disaster?",
      "How would the mood change if it was set at 3 AM?",
      "Place your scene in a location that contradicts its emotional tone.",
      "Add an environmental obstacle that complicates everything.",
      "What if the setting has a hidden history that affects the present?",
      "Make the weather reflect (or deliberately contradict) the emotional state.",
      "What small detail in the setting could foreshadow the ending?",
      "How would this scene be different in a crowded vs empty space?"
    ]
  },
  {
    category: 'emotion',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    prompts: [
      "Show this emotion through a physical action, not words.",
      "What memory would trigger this feeling in your character?",
      "How would your character hide this emotion from others?",
      "What small, specific detail would evoke this feeling in readers?",
      "Show the emotion through what the character notices in their environment.",
      "How does this emotion change what your character wants in the moment?",
      "What does this emotion make your character say that they'll regret?",
      "Show the emotion through rhythm and pace of the scene."
    ]
  },
  {
    category: 'twist',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-500',
    prompts: [
      "What if everything the reader believes turns out to be wrong?",
      "The antagonist's motivation is actually sympathetic - what is it?",
      "A seemingly minor character holds the key to everything.",
      "The goal the character has been chasing isn't what they actually need.",
      "What if the 'happy ending' comes with an unexpected cost?",
      "A trusted source of information has been unreliable all along.",
      "The solution to the problem was available from the beginning.",
      "Two storylines that seemed unrelated connect in a surprising way."
    ]
  },
  {
    category: 'dialogue',
    icon: Drama,
    color: 'from-amber-500 to-yellow-500',
    prompts: [
      "Write a conversation where both characters are lying to each other.",
      "Have characters discuss something mundane while the subtext is explosive.",
      "One character knows something the other desperately needs to learn.",
      "Write dialogue where what isn't said matters more than what is.",
      "Two characters have the same conversation but hear completely different things.",
      "Use dialogue to reveal character through speech patterns and word choice.",
      "A confrontation happens through indirect questions and statements.",
      "Characters communicate through what they choose not to say."
    ]
  }
];

const QUICK_STARTS: { label: string; prompt: string }[] = [
  { label: "What if...", prompt: "What if everything the protagonist believed was actually a carefully constructed lie?" },
  { label: "But then...", prompt: "But then, the one person they trusted most revealed their true intentions." },
  { label: "Meanwhile...", prompt: "Meanwhile, a seemingly unrelated event was about to change everything." },
  { label: "Unknown to them...", prompt: "Unknown to them, their actions had set something irreversible in motion." },
  { label: "The truth was...", prompt: "The truth was far more complicated than anyone could have imagined." }
];

export default function WritingPrompts({
  projectType,
  currentStep,
  onUsePrompt,
  className
}: WritingPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('conflict');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const currentCategoryData = PROMPT_CATEGORIES.find(c => c.category === selectedCategory)!;
  
  // Get random prompt from selected category
  const getRandomPrompt = () => {
    setIsSpinning(true);
    const prompts = currentCategoryData.prompts;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    
    // Small delay for animation
    setTimeout(() => {
      setCurrentPrompt(prompts[randomIndex]);
      setIsSpinning(false);
    }, 300);
  };
  
  // Initialize with a random prompt
  useEffect(() => {
    getRandomPrompt();
  }, [selectedCategory]);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleUse = () => {
    onUsePrompt?.(currentPrompt);
  };
  
  return (
    <div className={cn("bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Writing Prompts & Inspiration
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Get unstuck with creative prompts tailored to your needs
        </p>
      </div>
      
      {/* Quick Starts */}
      <div className="p-4 border-b border-white/10">
        <p className="text-xs text-gray-400 mb-2 font-medium">QUICK STORY STARTERS</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_STARTS.map((starter) => (
            <motion.button
              key={starter.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPrompt(starter.prompt);
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 transition-colors border border-white/10"
            >
              {starter.label}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="p-4 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PROMPT_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.category;
            
            return (
              <motion.button
                key={category.category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.category)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{category.category}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Current Prompt Display */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPrompt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-6 rounded-xl bg-gradient-to-br border border-white/10",
              currentCategoryData.color
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Brain className={cn("w-5 h-5 text-white", isSpinning && "animate-spin")} />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg leading-relaxed font-medium">
                  {currentPrompt}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={getRandomPrompt}
            disabled={isSpinning}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isSpinning && "animate-spin")} />
            New Prompt
          </motion.button>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </motion.button>
            
            {onUsePrompt && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUse}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                Use This
              </motion.button>
            )}
          </div>
        </div>
      </div>
      
      {/* All Prompts in Category */}
      <div className="p-4 border-t border-white/10 max-h-64 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-3 font-medium uppercase">
          All {selectedCategory} prompts
        </p>
        <div className="space-y-2">
          {currentCategoryData.prompts.map((prompt, index) => (
            <motion.button
              key={index}
              whileHover={{ x: 4 }}
              onClick={() => setCurrentPrompt(prompt)}
              className={cn(
                "w-full text-left p-3 rounded-lg text-sm transition-all",
                currentPrompt === prompt
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 flex-shrink-0" />
                <span className="line-clamp-2">{prompt}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
