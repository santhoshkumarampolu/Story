"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Icons } from "@/components/ui/icons";

interface TokenUpdate {
  id: string;
  tokens: number;
  cost: number;
  timestamp: number;
  type: "script" | "storyboard" | "treatment" | "idea";
  operation: string;
}

interface TokenUsage {
  usage: Array<{
    id: string;
    type: string;
    tokens: number;
    cost: number;
    createdAt: string;
  }>;
  totalTokens: number;
  totalCost: number;
}

interface TokenAnimationDisplayProps {
  tokenUsage: TokenUsage | null;
  tokenUpdates: TokenUpdate[];
}

const AnimatedCounter = ({ 
  value, 
  duration = 2000, 
  format = (num: number) => num.toString() 
}: { 
  value: number; 
  duration?: number; 
  format?: (num: number) => string; 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const startValue = displayValue;
    const difference = value - startValue;
    const steps = 60; // 60 FPS animation
    const stepValue = difference / steps;
    let currentStep = 0;

    intervalRef.current = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        setDisplayValue(startValue + (stepValue * currentStep));
      }
    }, duration / steps);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [value, duration, displayValue]);

  return <span>{format(Math.round(displayValue))}</span>;
};

const TokenIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "script":
      return <Icons.fileText className="h-4 w-4" />;
    case "storyboard":
      return <Icons.film className="h-4 w-4" />;
    case "treatment":
      return <Icons.scroll className="h-4 w-4" />;
    case "idea":
      return <Icons.lightbulb className="h-4 w-4" />;
    default:
      return <Icons.sparkles className="h-4 w-4" />;
  }
};

const FloatingUpdate = ({ update }: { update: TokenUpdate }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "script":
        return "from-blue-500/30 to-blue-600/30 text-blue-300 border-blue-500/40";
      case "storyboard":
        return "from-purple-500/30 to-purple-600/30 text-purple-300 border-purple-500/40";
      case "treatment":
        return "from-green-500/30 to-green-600/30 text-green-300 border-green-500/40";
      case "idea":
        return "from-yellow-500/30 to-yellow-600/30 text-yellow-300 border-yellow-500/40";
      default:
        return "from-gray-500/30 to-gray-600/30 text-gray-300 border-gray-500/40";
    }
  }
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 20, 
        scale: 0.8,
        rotateX: -90 
      }}
      animate={{ 
        opacity: 1, 
        y: [-10, -30, -40], 
        scale: [0.8, 1.1, 1],
        rotateX: 0 
      }}
      exit={{ 
        opacity: 0, 
        y: -60, 
        scale: 0.8,
        rotateX: 90 
      }}
      transition={{
        duration: 3.5,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 3.5 },
        y: { duration: 3.5, times: [0, 0.3, 1] },
        scale: { duration: 0.6, times: [0, 0.3, 1] }
      }}
      className={`absolute -top-16 right-0 px-4 py-2 rounded-xl border backdrop-blur-lg 
        bg-gradient-to-r ${getTypeColor(update.type)} shadow-lg min-w-[200px]`}
    >
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "linear" }}
        >
          <TokenIcon type={update.type} />
        </motion.div>
        <div className="flex-1">
          <div className="text-xs font-medium opacity-80">{update.operation}</div>
          <div className="flex items-center space-x-3 text-sm font-bold">
            {update.tokens > 0 && (
              <span className="flex items-center space-x-1">
                <Icons.sparkles className="h-3 w-3" />
                <span>+{update.tokens.toLocaleString()}</span>
              </span>
            )}
            {update.cost > 0 && (
              <span className="flex items-center space-x-1">
                <span className="text-xs">$</span>
                <span>+{update.cost.toFixed(3)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Sparkle effect */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Icons.sparkles className="h-3 w-3 text-yellow-400" />
      </motion.div>
    </motion.div>
  );
};

export function TokenAnimationDisplay({ tokenUsage, tokenUpdates }: TokenAnimationDisplayProps) {
  if (!tokenUsage) return null;

  return (
    <div className="text-sm text-gray-400 relative">
      {/* Main Display */}
      <motion.div 
        className="flex items-center space-x-6"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Tokens Counter */}
        <motion.div 
          className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10"
          whileHover={{ 
            borderColor: "rgba(147, 51, 234, 0.3)",
            backgroundColor: "rgba(147, 51, 234, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ 
              rotate: tokenUpdates.length > 0 ? [0, 10, -10, 0] : 0 
            }}
            transition={{ duration: 0.5 }}
          >
            <Icons.sparkles className="h-4 w-4 text-purple-400" />
          </motion.div>
          <span className="text-xs font-medium text-gray-500">Tokens:</span>
          <span className="font-mono font-bold text-white">
            <AnimatedCounter 
              value={tokenUsage.totalTokens}
              format={(num) => num.toLocaleString()}
            />
          </span>
        </motion.div>

        {/* Cost Counter */}
        <motion.div 
          className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10"
          whileHover={{ 
            borderColor: "rgba(34, 197, 94, 0.3)",
            backgroundColor: "rgba(34, 197, 94, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ 
              scale: tokenUpdates.length > 0 ? [1, 1.2, 1] : 1 
            }}
            transition={{ duration: 0.5 }}
            className="text-green-400 font-bold"
          >
            $
          </motion.div>
          <span className="text-xs font-medium text-gray-500">Cost:</span>
          <span className="font-mono font-bold text-white">
            <AnimatedCounter 
              value={tokenUsage.totalCost}
              format={(num) => num.toFixed(2)}
            />
          </span>
        </motion.div>
      </motion.div>

      {/* Floating Updates */}
      <AnimatePresence mode="wait">
        {tokenUpdates.map(update => (
          <FloatingUpdate key={update.id} update={update} />
        ))}
      </AnimatePresence>

      {/* Background pulse effect when updates occur */}
      <AnimatePresence>
        {tokenUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 -m-2 bg-gradient-to-r from-purple-500/20 via-transparent to-green-500/20 rounded-lg blur-sm -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
