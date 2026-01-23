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
  projectType?: string;
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
  ],
  // Podcast-specific steps
  format: [
    { icon: Lightbulb, label: "Format ideas", prompt: "What podcast format would work best for my concept?" },
    { icon: HelpCircle, label: "Episode structure", prompt: "Help me design a compelling episode structure" },
    { icon: RefreshCw, label: "Unique angle", prompt: "What unique format elements could set my podcast apart?" }
  ],
  'season-arc': [
    { icon: Sparkles, label: "Arc ideas", prompt: "How should my season's narrative build over episodes?" },
    { icon: HelpCircle, label: "Pacing", prompt: "How do I maintain listener interest across the season?" },
    { icon: RefreshCw, label: "Cliffhangers", prompt: "Suggest episode endings that keep listeners coming back" }
  ],
  episodes: [
    { icon: Lightbulb, label: "Episode hooks", prompt: "Give me compelling cold open ideas for my episodes" },
    { icon: HelpCircle, label: "Segment ideas", prompt: "What recurring segments could strengthen my podcast?" },
    { icon: RefreshCw, label: "Transitions", prompt: "Help me write smooth transitions between segments" }
  ],
  // Documentary-specific steps
  structure: [
    { icon: Sparkles, label: "Structure type", prompt: "What narrative structure would work best for my documentary?" },
    { icon: HelpCircle, label: "Story threads", prompt: "How do I weave multiple storylines effectively?" },
    { icon: RefreshCw, label: "Reveal timing", prompt: "When should I reveal key information for maximum impact?" }
  ],
  questions: [
    { icon: Lightbulb, label: "Deep questions", prompt: "What questions will draw out the most compelling responses?" },
    { icon: HelpCircle, label: "Follow-ups", prompt: "How do I dig deeper when subjects give surface answers?" },
    { icon: RefreshCw, label: "Emotional moments", prompt: "What questions might unlock emotional breakthroughs?" }
  ],
  // Novel/Story-specific steps
  premise: [
    { icon: Sparkles, label: "Deepen premise", prompt: "How can I make my premise more unique and compelling?" },
    { icon: HelpCircle, label: "Theme", prompt: "What deeper themes could I explore in this story?" },
    { icon: RefreshCw, label: "Hook", prompt: "Give me a stronger opening hook for this premise" }
  ],
  outline: [
    { icon: Lightbulb, label: "Plot points", prompt: "What key plot points should I include in my outline?" },
    { icon: HelpCircle, label: "Subplots", prompt: "What subplots would enrich my main story?" },
    { icon: RefreshCw, label: "Pacing", prompt: "How should I pace my story across chapters?" }
  ],
  chapters: [
    { icon: Sparkles, label: "Chapter hooks", prompt: "How do I make each chapter ending irresistible?" },
    { icon: HelpCircle, label: "Scene breaks", prompt: "Where should I place scene breaks for best effect?" },
    { icon: RefreshCw, label: "Transitions", prompt: "Help me write smooth chapter transitions" }
  ],
  // Web series specific
  'episode-outlines': [
    { icon: Lightbulb, label: "Episode arcs", prompt: "How should each episode's mini-arc work?" },
    { icon: HelpCircle, label: "Cliffhangers", prompt: "What cliffhangers would keep viewers watching?" },
    { icon: RefreshCw, label: "Pacing", prompt: "How do I pace episodes for binge-watching?" }
  ],
  // General fallback
  synopsis: [
    { icon: Sparkles, label: "Strengthen", prompt: "How can I make my synopsis more compelling?" },
    { icon: HelpCircle, label: "Key moments", prompt: "What key moments should my synopsis highlight?" },
    { icon: RefreshCw, label: "Tighten", prompt: "Help me tighten my synopsis to its essential elements" }
  ]
};

export default function AIWritingAssistant({
  projectId,
  projectType,
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
          projectType,
          currentStep,
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
      scenes: [
        "📍 Every scene needs a clear location and time. INT./EXT. - DAY/NIGHT format helps you visualize.",
        "⏩ Enter each scene late and leave early. Cut the fat - audiences don't need to see characters arrive and leave.",
        "🎯 Ask yourself: What's the purpose of this scene? It should advance plot, reveal character, or both."
      ],
      script: [
        "📝 Action lines should be short, punchy, and visual. Write what we SEE and HEAR only.",
        "💬 Great dialogue has subtext - what characters don't say is as important as what they do.",
        "🎭 Each character should have a distinct voice. Cover the names - can you tell who's speaking?"
      ],
      // Podcast-specific
      format: [
        "🎙️ Consider your listener's journey - how do they feel at the start vs end of each episode?",
        "⏱️ The sweet spot for podcasts is 20-45 minutes. What's the ideal length for your content?",
        "🎧 Think about recurring elements that listeners will anticipate and enjoy."
      ],
      'season-arc': [
        "📈 Build tension across your season - each episode should raise the stakes slightly.",
        "🎣 End early episodes with hooks that pay off later. Plant seeds now, harvest later.",
        "💫 Your season finale should feel inevitable yet surprising. What's the emotional climax?"
      ],
      episodes: [
        "🎬 Strong cold opens hook listeners in the first 30 seconds. What's your attention grabber?",
        "🔄 Vary your episode structure to keep things fresh while maintaining familiar elements.",
        "🎯 Each episode needs its own mini-arc with setup, conflict, and resolution."
      ],
      // Documentary-specific
      structure: [
        "📐 Consider if chronological, thematic, or character-driven structure serves your story best.",
        "🔀 Weaving multiple timelines or perspectives can create compelling documentary tension.",
        "🎯 Your structure should reveal information at exactly the right moment for maximum impact."
      ],
      questions: [
        "❓ The best interview questions are open-ended and specific. 'How did that make you feel?' beats 'Were you sad?'",
        "🎤 Follow-up questions often yield the best material. Don't rush to your next prepared question.",
        "💭 Sometimes silence after an answer prompts subjects to reveal more."
      ],
      // Novel/Story-specific
      premise: [
        "🌟 Your premise should contain the seed of your theme. What truth are you exploring?",
        "🎭 Strong premises have built-in conflict. What opposing forces exist in your concept?",
        "💡 Can you explain your premise in one breath? Complexity comes later - start simple."
      ],
      outline: [
        "📊 Your outline is a roadmap, not a prison. Leave room for discovery as you write.",
        "🔮 Know your ending before you begin. It helps every scene point toward something.",
        "⚖️ Balance plot points with character moments. Action without emotion is hollow."
      ],
      chapters: [
        "📖 Each chapter should have its own mini-arc and reason for existing.",
        "🎣 Chapter endings are promises to your reader. Make them want to turn the page.",
        "🌊 Vary your chapter lengths and pacing to create rhythm in your story."
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
          "fixed bottom-28 right-6 z-[60] p-4 rounded-full",
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
            className="fixed bottom-6 right-6 z-[70] w-96 max-h-[600px] bg-slate-900 rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden flex flex-col"
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
