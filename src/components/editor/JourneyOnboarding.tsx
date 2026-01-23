"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  X, ChevronRight, ChevronLeft, Sparkles, Lightbulb,
  PenTool, Users, Target, Trophy, Rocket, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  image?: string;
  tips?: string[];
}

interface JourneyOnboardingProps {
  projectType: string;
  onComplete: () => void;
  className?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Creative Journey! 🎬',
    description: "You're about to embark on a guided writing adventure. We'll walk you through each step, celebrating your progress along the way.",
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    tips: [
      "No pressure - work at your own pace",
      "Save your progress anytime",
      "AI is here to help when you're stuck"
    ]
  },
  {
    id: 'steps',
    title: 'Step-by-Step Guidance',
    description: "Each tab represents a stage in your creative process. Complete them in order, or jump around - it's your journey!",
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    tips: [
      "🔵 Blue = Current step",
      "✅ Green checkmark = Completed",
      "🔒 Gray = Not yet started"
    ]
  },
  {
    id: 'writing',
    title: 'Writing Tips & Prompts',
    description: "Every step comes with helpful prompts, tips, and suggestions. Stuck? Click 'Get a prompt' for instant inspiration!",
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-500',
    tips: [
      "Writing prompts spark new ideas",
      "Tips are based on professional techniques",
      "There's no wrong way to use them"
    ]
  },
  {
    id: 'ai',
    title: 'AI Writing Assistant',
    description: "Look for the chat button in the corner. Your AI writing buddy is always ready to help brainstorm, refine, or push past blocks.",
    icon: PenTool,
    color: 'from-green-500 to-emerald-500',
    tips: [
      "Ask questions about your story",
      "Request feedback on your writing",
      "Get suggestions when you're stuck"
    ]
  },
  {
    id: 'progress',
    title: 'Track Your Progress',
    description: "Watch your progress bar fill up as you complete steps. Unlock achievements and celebrate milestones along the way!",
    icon: Trophy,
    color: 'from-yellow-500 to-amber-500',
    tips: [
      "🎉 Confetti for completed steps!",
      "🏆 Earn achievements as you write",
      "📊 Track your writing stats"
    ]
  },
  {
    id: 'ready',
    title: "You're Ready! Let's Create",
    description: "That's everything you need to know. Your story is waiting to be told. Take a deep breath and let's begin!",
    icon: Rocket,
    color: 'from-rose-500 to-red-500',
    tips: [
      "Start with what excites you most",
      "Imperfect drafts beat empty pages",
      "Your unique voice matters"
    ]
  }
];

export default function JourneyOnboarding({
  projectType,
  onComplete,
  className
}: JourneyOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
          className
        )}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep
                    ? "bg-white"
                    : index < currentStep
                    ? "bg-purple-500"
                    : "bg-white/20"
                )}
              />
            ))}
          </div>

          {/* Icon header */}
          <div className={cn(
            "pt-16 pb-8 px-8 bg-gradient-to-br",
            step.color
          )}>
            <motion.div
              key={step.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
              className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
            >
              <step.icon className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white text-center mb-3">
                  {step.title}
                </h2>
                <p className="text-gray-400 text-center mb-6 leading-relaxed">
                  {step.description}
                </p>

                {step.tips && (
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    {step.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                        {tip}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={cn(
                "text-gray-400 hover:text-white",
                isFirstStep && "invisible"
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="text-gray-500 hover:text-gray-300"
            >
              Skip Tutorial
            </Button>

            <Button
              onClick={handleNext}
              className={cn(
                "bg-gradient-to-r text-white",
                step.color
              )}
            >
              {isLastStep ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Writing
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
