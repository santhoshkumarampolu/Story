"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { useState, useEffect } from "react";

interface TokenUpdate {
  id: string;
  tokens: number;
  cost: number;
  timestamp: number;
  type: "script" | "storyboard" | "treatment" | "idea" | "logline" | "character_generation" | "scenes";
  operation: string;
}

interface OperationNotificationProps {
  tokenUpdates: TokenUpdate[];
}

const getOperationData = (type: string) => {
  switch (type) {
    case "script":
      return { 
        color: "blue", 
        icon: Icons.fileText, 
        bgGradient: "from-blue-500/20 to-blue-600/20",
        borderColor: "border-blue-500/30",
        successMessage: "Script generated successfully! Your story is coming to life."
      };
    case "storyboard":
      return { 
        color: "purple", 
        icon: Icons.film, 
        bgGradient: "from-purple-500/20 to-purple-600/20",
        borderColor: "border-purple-500/30",
        successMessage: "Visual storyboard created! Your scene is now visualized."
      };
    case "treatment":
      return { 
        color: "green", 
        icon: Icons.scroll, 
        bgGradient: "from-green-500/20 to-green-600/20",
        borderColor: "border-green-500/30",
        successMessage: "Treatment completed! Your story structure is refined."
      };
    case "idea":
      return { 
        color: "yellow", 
        icon: Icons.lightbulb, 
        bgGradient: "from-yellow-500/20 to-yellow-600/20",
        borderColor: "border-yellow-500/30",
        successMessage: "Creative ideas generated! Your inspiration is flowing."
      };
    default:
      return { 
        color: "purple", 
        icon: Icons.sparkles, 
        bgGradient: "from-purple-500/20 to-purple-600/20",
        borderColor: "border-purple-500/30",
        successMessage: "AI operation completed successfully!"
      };
  }
};

const CompletionNotification = ({ update }: { update: TokenUpdate }) => {
  const operationData = getOperationData(update.type);
  const IconComponent = operationData.icon;

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8, 
        y: 50,
        rotateX: -90 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        rotateX: 0 
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.8, 
        y: -30,
        rotateX: 90 
      }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`bg-gradient-to-r ${operationData.bgGradient} backdrop-blur-lg 
        border ${operationData.borderColor} rounded-xl p-4 shadow-xl min-w-[350px]`}
    >
      <div className="flex items-start space-x-3">
        {/* Success Icon with Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              ease: "easeInOut"
            }}
            className={`p-2 bg-gradient-to-br from-white/10 to-white/5 rounded-lg`}
          >
            <IconComponent className={`h-6 w-6 text-${operationData.color}-400`} />
          </motion.div>
          
          {/* Success checkmark overlay */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
          >
            <Icons.check className="h-3 w-3 text-white" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <motion.h4 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-semibold text-white mb-1"
          >
            {update.operation} Complete!
          </motion.h4>
          
          <motion.p 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-${operationData.color}-300 text-sm mb-3`}
          >
            {operationData.successMessage}
          </motion.p>

          {/* Usage Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4 text-xs"
          >
            {update.tokens > 0 && (
              <div className="flex items-center space-x-1 text-gray-300">
                <Icons.sparkles className="h-3 w-3" />
                <span className="font-medium">{update.tokens.toLocaleString()}</span>
                <span className="opacity-70">tokens used</span>
              </div>
            )}
            {update.cost > 0 && (
              <div className="flex items-center space-x-1 text-gray-300">
                <span className="font-bold text-green-400">$</span>
                <span className="font-medium">{update.cost.toFixed(3)}</span>
                <span className="opacity-70">spent</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          onClick={() => {}} // Will be handled by parent timeout
        >
          <Icons.close className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Animated progress bar */}
      <motion.div
        className="mt-3 h-1 bg-gray-700/50 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className={`h-full bg-gradient-to-r from-${operationData.color}-500 to-${operationData.color}-400`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.6, duration: 2, ease: "easeOut" }}
        />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 bg-${operationData.color}-400/40 rounded-full`}
            initial={{ 
              x: Math.random() * 350, 
              y: Math.random() * 100 + 50,
              opacity: 0 
            }}
            animate={{
              y: [null, -30],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 0.5]
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export function OperationNotification({ tokenUpdates }: OperationNotificationProps) {
  const [notifications, setNotifications] = useState<TokenUpdate[]>([]);

  useEffect(() => {
    // Add new updates to notifications
    tokenUpdates.forEach(update => {
      setNotifications(prev => {
        const exists = prev.find(n => n.id === update.id);
        if (!exists) {
          return [...prev, update];
        }
        return prev;
      });
    });
  }, [tokenUpdates]);

  // Separate effect for auto-removing expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => 
          Date.now() - notification.timestamp < 6000
        )
      );
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map(notification => (
          <CompletionNotification 
            key={notification.id} 
            update={notification} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
