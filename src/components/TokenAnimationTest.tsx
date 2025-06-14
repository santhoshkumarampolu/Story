"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { TokenAnimationDisplay } from "./TokenAnimationDisplay";
import { OperationNotification } from "./OperationNotification";

interface TokenUpdate {
  id: string;
  tokens: number;
  cost: number;
  timestamp: number;
  type: "script" | "storyboard" | "treatment" | "idea" | "logline" | "character_generation" | "scenes";
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

export function TokenAnimationTest() {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    usage: [],
    totalTokens: 1500,
    totalCost: 0.045
  });
  
  const [tokenUpdates, setTokenUpdates] = useState<TokenUpdate[]>([]);

  const simulateTokenUsage = (type: "script" | "storyboard" | "treatment" | "idea" | "logline" | "character_generation" | "scenes") => {
    const operations = {
      script: { name: "Script Generation", tokens: 850, cost: 0.025 },
      storyboard: { name: "Storyboard Creation", tokens: 0, cost: 0.04 },
      treatment: { name: "Treatment Writing", tokens: 650, cost: 0.019 },
      idea: { name: "Idea Generation", tokens: 420, cost: 0.012 },
      logline: { name: "Logline Generation", tokens: 100, cost: 0.002 }, // Added logline
      character_generation: { name: "Character Generation", tokens: 500, cost: 0.01 }, // Added character_generation
      scenes: { name: "Scene Generation", tokens: 700, cost: 0.02 } // Added scenes
    };

    const operation = operations[type];
    
    console.log("[TokenAnimationTest] Simulating:", operation);
    
    // Update totals
    setTokenUsage(prev => {
      const newUsage = {
        ...prev,
        totalTokens: prev.totalTokens + operation.tokens,
        totalCost: prev.totalCost + operation.cost
      };
      console.log("[TokenAnimationTest] New totals:", newUsage);
      return newUsage;
    });

    // Add animation update
    const update: TokenUpdate = {
      id: Date.now().toString(),
      tokens: operation.tokens,
      cost: operation.cost,
      timestamp: Date.now(),
      type,
      operation: operation.name
    };

    console.log("[TokenAnimationTest] Adding update:", update);
    setTokenUpdates(prev => [...prev, update]);

    // Remove update after animation
    setTimeout(() => {
      setTokenUpdates(prev => prev.filter(u => u.id !== update.id));
    }, 4000);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Token Animation Test</h1>
          <p className="text-gray-400 mb-8">Test the token usage animation system</p>
        </div>

        {/* Token Display */}
        <div className="bg-black/50 p-6 rounded-lg border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Current Usage</h2>
          <TokenAnimationDisplay 
            tokenUsage={tokenUsage}
            tokenUpdates={tokenUpdates}
          />
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => simulateTokenUsage("script")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Test Script Generation
          </Button>
          <Button
            onClick={() => simulateTokenUsage("storyboard")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Test Storyboard Creation
          </Button>
          <Button
            onClick={() => simulateTokenUsage("treatment")}
            className="bg-green-600 hover:bg-green-700"
          >
            Test Treatment Writing
          </Button>
          <Button
            onClick={() => simulateTokenUsage("idea")}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Test Idea Generation
          </Button>
          <Button
            onClick={() => simulateTokenUsage("logline")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Test Logline Generation
          </Button>
          <Button
            onClick={() => simulateTokenUsage("character_generation")}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Test Character Generation
          </Button>
          <Button
            onClick={() => simulateTokenUsage("scenes")}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Test Scene Generation
          </Button>
        </div>

        {/* Current Updates Debug */}
        <div className="bg-black/50 p-4 rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-2">Active Updates (Debug)</h3>
          <div className="text-xs text-gray-400 space-y-1">
            {tokenUpdates.map(update => (
              <div key={update.id} className="flex justify-between">
                <span>{update.operation}</span>
                <span>Tokens: {update.tokens}, Cost: ${update.cost.toFixed(3)}</span>
              </div>
            ))}
            {tokenUpdates.length === 0 && <span>No active updates</span>}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50">
        <OperationNotification tokenUpdates={tokenUpdates} />
      </div>
    </div>
  );
}
