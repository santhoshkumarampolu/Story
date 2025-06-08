"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface AIOperationProgressProps {
  isGenerating: boolean;
  operationType: "script" | "storyboard" | "treatment" | "idea" | "logline" | "character_generation"; // Added "character_generation"
  operationName: string;
}

const getOperationEstimates = (type: string) => {
  switch (type) {
    case "script":
      return { tokens: 800, cost: 0.024, duration: 15000 };
    case "storyboard":
      return { tokens: 0, cost: 0.08, duration: 20000 };
    case "treatment":
      return { tokens: 1200, cost: 0.036, duration: 18000 };
    case "idea":
      return { tokens: 600, cost: 0.018, duration: 12000 };
    case "logline":
      return { tokens: 300, cost: 0.009, duration: 8000 };
    case "character_generation": // Added estimates for character_generation
      return { tokens: 700, cost: 0.021, duration: 16000 };
    default:
      return { tokens: 500, cost: 0.015, duration: 10000 };
  }
};

const getOperationIcon = (type: string) => {
  switch (type) {
    case "script":
      return <Icons.fileText className="h-5 w-5" />;
    case "storyboard":
      return <Icons.film className="h-5 w-5" />;
    case "treatment":
      return <Icons.scroll className="h-5 w-5" />;
    case "idea":
      return <Icons.lightbulb className="h-5 w-5" />;
    case "logline":
      return <Icons.fileText className="h-5 w-5" />;
    case "character_generation": // Added icon for character_generation
      return <Icons.users className="h-5 w-5" />;
    default:
      return <Icons.sparkles className="h-5 w-5" />;
  }
};

const getOperationColor = (type: string) => {
  switch (type) {
    case "script":
      return "blue";
    case "storyboard":
      return "purple";
    case "treatment":
      return "green";
    case "idea":
      return "yellow";
    case "logline":
      return "orange";
    case "character_generation": // Added color for character_generation
      return "pink"; // Example color
    default:
      return "purple";
  }
};

export function AIOperationProgress({ 
  isGenerating, 
  operationType, 
  operationName 
}: AIOperationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing...");
  
  const estimates = getOperationEstimates(operationType);
  const color = getOperationColor(operationType);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setStage("Initializing...");
      return;
    }

    const stages = [
      { text: "Connecting to AI...", duration: 1000 },
      { text: "Processing your request...", duration: 3000 },
      { text: "Generating content...", duration: estimates.duration * 0.6 },
      { text: "Finalizing...", duration: estimates.duration * 0.2 },
      { text: "Complete!", duration: 500 }
    ];

    let currentStage = 0;
    let totalElapsed = 0;
    
    const updateProgress = () => {
      if (currentStage >= stages.length) return;
      
      const currentStageData = stages[currentStage];
      setStage(currentStageData.text);
      
      const stageProgress = Math.min(100, (totalElapsed / estimates.duration) * 100);
      setProgress(stageProgress);
      
      setTimeout(() => {
        totalElapsed += currentStageData.duration;
        currentStage++;
        if (currentStage < stages.length) {
          updateProgress();
        }
      }, currentStageData.duration);
    };

    updateProgress();
  }, [isGenerating, estimates.duration]);

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`bg-black/90 backdrop-blur-lg border border-${color}-500/30 rounded-xl p-6 min-w-[400px] shadow-2xl`}>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`text-${color}-400`}
              >
                {getOperationIcon(operationType)}
              </motion.div>
              <div>
                <h3 className="text-white font-semibold">{operationName}</h3>
                <p className={`text-${color}-300 text-sm`}>{stage}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
              <Progress 
                value={progress} 
                className={`h-2 bg-gray-800`}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{Math.round(progress)}% complete</span>
                <span>~{Math.max(0, Math.round((estimates.duration - (progress/100 * estimates.duration)) / 1000))}s remaining</span>
              </div>
            </div>

            {/* Estimates */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-4">
                {estimates.tokens > 0 && (
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Icons.sparkles className="h-3 w-3" />
                    <span>~{estimates.tokens.toLocaleString()} tokens</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-gray-400">
                  <span className="font-bold">$</span>
                  <span>~${estimates.cost.toFixed(3)} cost</span>
                </div>
              </div>
              
              {/* Animated dots */}
              <motion.div
                className="flex space-x-1"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-1 h-1 bg-${color}-400 rounded-full`}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 bg-${color}-400/30 rounded-full`}
                  initial={{ 
                    x: Math.random() * 400, 
                    y: Math.random() * 200,
                    opacity: 0 
                  }}
                  animate={{
                    y: [null, -20],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
