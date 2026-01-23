"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MessageCircle, X, Send, Sparkles, Lightbulb, 
  HelpCircle, RefreshCw, Copy, Check
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickPrompt {
  icon: any;
  label: string;
  prompt: string;
}

interface AIWritingAssistantProps {
  projectId: string;
  currentStep: string;
  currentContent: string;
  onInsertText: (text: string) => void;
  className?: string;
}

const QUICK_PROMPTS: Record<string, QuickPrompt[]> = {
  idea: [
    { icon: Lightbulb, label: "Spark an idea", prompt: "Give me 3 unique story ideas based on current trends" },
    { icon: HelpCircle, label: "What if...", prompt: "Generate 5 'what if' scenarios for an interesting story" },
    { icon: RefreshCw, label: "Twist it", prompt: "Take a common story premise and give it an unexpected twist" }
  ],
  logline: [
    { icon: Sparkles, label: "Hook me", prompt: "Create a compelling hook for my story idea" },
    { icon: HelpCircle, label: "Stakes check", prompt: "How can I raise the stakes in my logline?" },
    { icon: RefreshCw, label: "Rewrite", prompt: "Rewrite my logline to be more impactful" }
  ],
  characters: [
    { icon: Lightbulb, label: "Deepen character", prompt: "What hidden flaw would make my protagonist more interesting?" },
    { icon: HelpCircle, label: "Motivation", prompt: "Help me understand what really drives my character" },
    { icon: RefreshCw, label: "Surprise me", prompt: "Give my character a surprising contradiction" }
  ],
  treatment: [
    { icon: Sparkles, label: "Plot twist", prompt: "Suggest a midpoint twist that changes everything" },
    { icon: HelpCircle, label: "Pacing", prompt: "Where should I add tension or release?" },
    { icon: RefreshCw, label: "Structure check", prompt: "Analyze my story structure and suggest improvements" }
  ],
  scenes: [
    { icon: Lightbulb, label: "Visual moment", prompt: "What iconic visual moment could elevate this scene?" },
    { icon: HelpCircle, label: "Conflict", prompt: "How can I add more conflict to this scene?" },
    { icon: RefreshCw, label: "Enter late", prompt: "Help me find the latest point to enter this scene" }
  ],
  script: [
    { icon: Sparkles, label: "Subtext", prompt: "Add subtext to this dialogue - what are they NOT saying?" },
    { icon: HelpCircle, label: "Action lines", prompt: "Make my action lines more cinematic" },
    { icon: RefreshCw, label: "Dialogue polish", prompt: "Polish this dialogue to sound more natural" }
  ]
};

export default function AIWritingAssistant({
  projectId,
  currentStep,
  currentContent,
  onInsertText,
  className
}: AIWritingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const quickPrompts = QUICK_PROMPTS[currentStep] || QUICK_PROMPTS.idea;
  
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call your AI endpoint here
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          step: currentStep,
          context: currentContent,
          message: content
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || "I'm here to help! Try asking me about your story.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response for demo
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateFallbackResponse(content, currentStep),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      // Fallback response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateFallbackResponse(content, currentStep),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateFallbackResponse = (query: string, step: string): string => {
    const responses: Record<string, string[]> = {
      idea: [
        "💡 Consider starting with a character in an unexpected situation. What's the most surprising place they could be?",
        "🎬 Think about what you'd love to SEE on screen. The best ideas are often visual first.",
        "❓ What question about life or humanity do you want to explore? Stories are answers to questions."
      ],
      logline: [
        "🎯 Your logline needs: A specific protagonist, a clear goal, and high stakes. Which is missing?",
        "⚡ Try the formula: When [event], a [character] must [action] or [consequence].",
        "🎭 Make sure your logline hints at genre. A comedy and thriller have different promises."
      ],
      characters: [
        "🎭 Give your character a contradiction - someone who is brave but afraid of intimacy, or kind but secretly jealous.",
        "💔 What wound from the past drives their behavior? Hurt people make interesting choices.",
        "🔮 What does your character want vs. what do they need? The gap between creates the arc."
      ],
      treatment: [
        "📈 Check your tension: Does each scene raise the stakes? If not, cut or escalate.",
        "🔄 Your midpoint should spin the story in a new direction. What reversal could change everything?",
        "💫 Make sure your protagonist is ACTIVE, not reactive. They should drive the plot."
      ],
      default: [
        "✍️ Keep writing! The first draft is about getting the story out. Polish comes later.",
        "🎯 Focus on what your character WANTS in every scene. Desire drives drama.",
        "💡 When stuck, ask: What's the worst thing that could happen right now?"
      ]
    };
    
    const stepResponses = responses[step] || responses.default;
    return stepResponses[Math.floor(Math.random() * stepResponses.length)];
  };
  
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const insertIntoEditor = (text: string) => {
    onInsertText(text);
    // Provide feedback
  };
  
  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 z-40 p-4 rounded-full",
          "bg-gradient-to-r from-purple-600 to-pink-600",
          "text-white shadow-lg shadow-purple-500/30",
          "hover:shadow-xl hover:shadow-purple-500/40 transition-shadow",
          isOpen && "hidden",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
      
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-slate-900 rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Writing Assistant</h3>
                  <p className="text-xs text-gray-400">Ask me anything about your story</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Prompts */}
            <div className="p-3 border-b border-white/10">
              <p className="text-xs text-gray-500 mb-2">Quick prompts for {currentStep}:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(prompt.prompt)}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    <prompt.icon className="w-3 h-3" />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500/50" />
                  <p className="text-sm">I'm your AI writing partner!</p>
                  <p className="text-xs mt-1">Ask me for ideas, feedback, or help with your story.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      message.role === 'user'
                        ? "bg-purple-600 text-white rounded-br-md"
                        : "bg-white/10 text-gray-200 rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedId === message.id ? (
                            <><Check className="w-3 h-3" /> Copied</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy</>
                          )}
                        </button>
                        <button
                          onClick={() => insertIntoEditor(message.content)}
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Use this
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </motion.div>
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your story..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
