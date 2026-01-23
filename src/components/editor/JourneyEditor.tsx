"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Lightbulb, FileText, Users, Clapperboard, PenTool, Sparkles, 
  ChevronRight, ChevronLeft, Check, Lock, Trophy, Flame, 
  MessageCircle, Zap, Target, Star, ArrowRight, Play,
  Pause, RotateCcw, Clock, BookOpen, Volume2, Mic, Home, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkflowStep {
  id: string;
  label: string;
  icon: any;
  description: string;
  prompt: string;
  tips: string[];
  celebration: string;
  minWords?: number;
}

interface JourneyEditorProps {
  projectId: string;
  projectType: string;
  projectTitle: string;
  currentLanguage: string;
  initialData: {
    idea?: string;
    logline?: string;
    treatment?: string;
    synopsis?: string;
    theme?: string;
    characters?: any[];
    scenes?: any[];
  };
  onSave: (step: string, content: any) => Promise<void>;
  onGenerate: (step: string) => Promise<string>;
  onModeChange?: (mode: 'classic' | 'journey') => void;
}

const WORKFLOW_STEPS: Record<string, WorkflowStep[]> = {
  shortfilm: [
    {
      id: 'idea',
      label: 'The Spark',
      icon: Lightbulb,
      description: "Every great film starts with a single idea. What's the moment that captivates you?",
      prompt: "Close your eyes. Picture a scene that excites you. What do you see? Who's there? What's happening?",
      tips: [
        "💡 Start with 'What if...' to unlock possibilities",
        "🎬 Think visual - what would look amazing on screen?",
        "❤️ What emotion do you want audiences to feel?",
        "⏱️ Remember: Short films thrive on a single powerful moment"
      ],
      celebration: "Brilliant! Your spark is lit! 🔥",
      minWords: 20
    },
    {
      id: 'logline',
      label: 'The Hook',
      icon: Target,
      description: "Capture your entire story in one irresistible sentence.",
      prompt: "When [something happens], a [character] must [do something] before [stakes].",
      tips: [
        "🎯 Include: WHO, WHAT THEY WANT, WHAT'S STOPPING THEM",
        "⚡ Make it specific - avoid generic words",
        "🎭 Hint at the genre and tone",
        "📏 Aim for 25-35 words max"
      ],
      celebration: "That's a hook that grabs! 🎣",
      minWords: 15
    },
    {
      id: 'treatment',
      label: 'The Blueprint',
      icon: FileText,
      description: "Expand your idea into a complete story overview.",
      prompt: "Tell your story from beginning to end. What happens? How do characters change?",
      tips: [
        "📖 Use present tense: 'She walks' not 'She walked'",
        "🎬 Include key visual moments",
        "💔 Show the emotional journey",
        "🔄 Setup → Conflict → Resolution"
      ],
      celebration: "Your story has structure! 🏗️",
      minWords: 100
    },
    {
      id: 'characters',
      label: 'The Players',
      icon: Users,
      description: "Bring your characters to life with depth and purpose.",
      prompt: "Who are the people in your story? What do they want? What's holding them back?",
      tips: [
        "🎭 Every character needs a WANT and a FLAW",
        "💬 How do they speak? What's unique about them?",
        "🔗 How do characters create conflict with each other?",
        "👤 Even minor characters need a purpose"
      ],
      celebration: "Your cast is ready for their close-up! 🌟",
      minWords: 50
    },
    {
      id: 'scenes',
      label: 'The Breakdown',
      icon: Clapperboard,
      description: "Structure your story into filmable scenes.",
      prompt: "Break your story into scenes. Each scene needs: Location, Time, What Happens.",
      tips: [
        "📍 INT./EXT. LOCATION - DAY/NIGHT",
        "⏩ Start scenes late, end them early",
        "🎯 Every scene should advance plot OR character",
        "🎨 Vary your locations for visual interest"
      ],
      celebration: "Your scenes are set! 🎬",
      minWords: 100
    },
    {
      id: 'script',
      label: 'The Script',
      icon: PenTool,
      description: "Transform your blueprint into a shooting script.",
      prompt: "Write your screenplay with proper format: Scene headings, action, dialogue.",
      tips: [
        "📝 Action lines: short, visual, present tense",
        "💬 Dialogue: how people really talk",
        "🎭 Use subtext - what's NOT said",
        "📄 One page ≈ one minute of screen time"
      ],
      celebration: "Your screenplay is complete! 🏆",
      minWords: 500
    }
  ],
  shortstory: [
    {
      id: 'idea',
      label: 'The Seed',
      icon: Lightbulb,
      description: "Plant the seed of your story. What truth do you want to explore?",
      prompt: "What moment, feeling, or question has been living in your mind? Start there.",
      tips: [
        "💡 Start with a character in a moment of change",
        "❓ What question does your story ask?",
        "🎭 Short stories excel at a single emotional truth",
        "✨ What image or scene keeps calling to you?"
      ],
      celebration: "Your seed is planted! 🌱",
      minWords: 20
    },
    {
      id: 'premise',
      label: 'The Core',
      icon: Target,
      description: "Distill your story to its essential premise.",
      prompt: "A [character] struggles with [conflict] and discovers [insight].",
      tips: [
        "🎯 Focus on ONE character's internal journey",
        "💔 What do they want vs. what do they need?",
        "🔮 Hint at the transformation ahead",
        "📏 Keep it to 2-3 sentences max"
      ],
      celebration: "You've found your core! 💎",
      minWords: 20
    },
    {
      id: 'theme',
      label: 'The Meaning',
      icon: BookOpen,
      description: "What deeper truth does your story illuminate?",
      prompt: "Beyond the plot, what is your story really about?",
      tips: [
        "🌊 Theme emerges from character choices",
        "🔍 Don't state it - show it",
        "🎭 Multiple interpretations make great stories",
        "💫 Universal themes, specific details"
      ],
      celebration: "Your story has depth! 🌊",
      minWords: 30
    },
    {
      id: 'characters',
      label: 'The Voice',
      icon: Users,
      description: "Create a character whose voice we can't forget.",
      prompt: "Who is telling this story? What makes their perspective unique?",
      tips: [
        "👁️ What does only THIS character notice?",
        "💬 How do they think and speak?",
        "🔒 What are they hiding from themselves?",
        "🌟 Give them surprising contradictions"
      ],
      celebration: "Your character has a voice! 🎤",
      minWords: 50
    },
    {
      id: 'outline',
      label: 'The Arc',
      icon: FileText,
      description: "Map the emotional journey of your story.",
      prompt: "Trace the path from opening hook to resonant ending.",
      tips: [
        "🎣 Hook readers in the first paragraph",
        "📈 Build tension through complications",
        "🔄 Find the turning point",
        "✨ End with resonance, not resolution"
      ],
      celebration: "Your arc is complete! 🌈",
      minWords: 80
    },
    {
      id: 'narrative-draft',
      label: 'The Draft',
      icon: PenTool,
      description: "Let your story flow onto the page.",
      prompt: "Write freely. You can always revise, but you can't edit a blank page.",
      tips: [
        "✍️ Silence your inner critic",
        "🎨 Use all five senses",
        "💬 Dialogue reveals character",
        "📖 Read it aloud to hear the rhythm"
      ],
      celebration: "You've written a story! 🎉",
      minWords: 1000
    }
  ],
  novel: [
    {
      id: 'idea',
      label: 'The Vision',
      icon: Lightbulb,
      description: "Dream big. What world do you want to build?",
      prompt: "If you could live in any story, what would it be? Now make it yours.",
      tips: [
        "🌍 Think about scope - novels need room to breathe",
        "❓ What big question will drive 80,000+ words?",
        "🎭 Multiple characters, interweaving plots",
        "⏳ Consider the timeline of your story"
      ],
      celebration: "Your vision is taking shape! 🔮",
      minWords: 50
    },
    {
      id: 'genre',
      label: 'The Market',
      icon: Target,
      description: "Position your novel for success.",
      prompt: "What shelf would your book sit on? Who picks it up?",
      tips: [
        "📚 Know your genre's conventions",
        "🎯 Who is your ideal reader?",
        "📖 Find comp titles: 'X meets Y'",
        "🔄 What tropes will you embrace or subvert?"
      ],
      celebration: "You know your audience! 🎯",
      minWords: 40
    },
    {
      id: 'premise',
      label: 'The Pitch',
      icon: FileText,
      description: "Craft your query-ready premise.",
      prompt: "When [inciting incident], [protagonist] must [goal] or face [stakes].",
      tips: [
        "🎣 Make it impossible to put down",
        "⚡ Specificity is memorable",
        "💔 High personal stakes",
        "🎭 Voice should shine through"
      ],
      celebration: "Agents would want more! 📩",
      minWords: 50
    },
    {
      id: 'characters',
      label: 'The Cast',
      icon: Users,
      description: "Populate your world with unforgettable characters.",
      prompt: "Create your protagonist, antagonist, and key supporting players.",
      tips: [
        "🎭 Protagonist: clear want, hidden need",
        "👤 Antagonist: valid (to them) motivation",
        "🔗 Characters should challenge each other",
        "💫 Each major character gets an arc"
      ],
      celebration: "Your cast is assembled! 🌟",
      minWords: 200
    },
    {
      id: 'world-building',
      label: 'The World',
      icon: Star,
      description: "Build a world readers want to live in.",
      prompt: "What are the rules, culture, and texture of your story's world?",
      tips: [
        "🏛️ History shapes the present",
        "🌿 Sensory details bring it alive",
        "⚙️ Rules create meaningful conflict",
        "🗺️ Only show what matters to the story"
      ],
      celebration: "Your world is alive! 🌍",
      minWords: 150
    },
    {
      id: 'plot-outline',
      label: 'The Structure',
      icon: Clapperboard,
      description: "Architect your plot with key turning points.",
      prompt: "Map the major beats: inciting incident, midpoint, dark night, climax.",
      tips: [
        "📐 Three-act structure as foundation",
        "🔄 Subplots weave through main plot",
        "📈 Rising stakes throughout",
        "🎯 Every scene must earn its place"
      ],
      celebration: "Your structure is solid! 🏗️",
      minWords: 300
    },
    {
      id: 'chapter-breakdown',
      label: 'The Blueprint',
      icon: FileText,
      description: "Break your novel into chapters.",
      prompt: "Plan each chapter: POV, purpose, key events, ending hook.",
      tips: [
        "📖 2,000-5,000 words per chapter typical",
        "🎣 End chapters on hooks",
        "🔄 Vary pacing and intensity",
        "👁️ Track POV if using multiple"
      ],
      celebration: "Ready to write! 📝",
      minWords: 400
    }
  ],
  screenplay: [
    {
      id: 'idea',
      label: 'The Concept',
      icon: Lightbulb,
      description: "Every great film starts with a concept that grabs attention.",
      prompt: "What's the movie you wish existed? The story only you can tell?",
      tips: [
        "🎬 Think in visual terms - film is a visual medium",
        "❓ What's the 'what if?' that makes this unique",
        "🎭 Strong concept = easier to sell",
        "⏱️ 90-120 minutes to tell your story"
      ],
      celebration: "Hollywood is calling! 📞",
      minWords: 30
    },
    {
      id: 'logline',
      label: 'The Pitch',
      icon: Target,
      description: "One sentence that sells your entire movie.",
      prompt: "When [catalyst], [protagonist with flaw] must [action] or else [stakes].",
      tips: [
        "🎯 Include irony for memorability",
        "⚡ Create visual images in the reader's mind",
        "💰 Think: Would someone pay $15 to see this?",
        "📏 Max 2 sentences, ideally one"
      ],
      celebration: "You'd get the meeting! 🤝",
      minWords: 20
    },
    {
      id: 'theme',
      label: 'The Theme',
      icon: BookOpen,
      description: "What universal truth does your film explore?",
      prompt: "Complete: My film is really about ____.",
      tips: [
        "🎭 Theme grounds every creative decision",
        "💡 Express it as a question, not an answer",
        "🔗 Every character relates to the theme",
        "🎬 Show it, never state it"
      ],
      celebration: "Your film has meaning! 💫",
      minWords: 30
    },
    {
      id: 'treatment',
      label: 'The Treatment',
      icon: FileText,
      description: "Tell your story in prose, page by page.",
      prompt: "Write the movie as if you're describing it to a friend.",
      tips: [
        "📝 Present tense, third person",
        "🎬 Describe what we SEE and HEAR",
        "💬 Include sample dialogue sparingly",
        "📄 2-10 pages typical"
      ],
      celebration: "Your story lives! 🌟",
      minWords: 200
    },
    {
      id: 'characters',
      label: 'The Characters',
      icon: Users,
      description: "Create characters that actors dream of playing.",
      prompt: "Build your protagonist, antagonist, and key players.",
      tips: [
        "🎭 External want vs. internal need",
        "👤 Antagonist believes they're the hero",
        "🔗 Each character challenges the protagonist",
        "💬 Give each a distinct voice"
      ],
      celebration: "A-list worthy! 🌟",
      minWords: 150
    },
    {
      id: 'structure',
      label: 'The Structure',
      icon: Clapperboard,
      description: "Map your story with the three-act structure.",
      prompt: "Define: Setup, Confrontation, Resolution. Where are your major turns?",
      tips: [
        "📐 Act 1: 25 pages | Act 2: 50 pages | Act 3: 25 pages",
        "🔄 Midpoint flips everything",
        "⬇️ All Is Lost = lowest point",
        "🏆 Climax answers the central question"
      ],
      celebration: "Structurally sound! 🏗️",
      minWords: 200
    },
    {
      id: 'scenes',
      label: 'The Scenes',
      icon: FileText,
      description: "Break down your script scene by scene.",
      prompt: "Each scene: INT/EXT, LOCATION, TIME, PURPOSE, CONFLICT.",
      tips: [
        "🎬 40-60 scenes in a feature",
        "⏩ Enter late, exit early",
        "🎯 Every scene advances plot or character",
        "🔄 Vary emotional temperature"
      ],
      celebration: "Ready for the page! 📝",
      minWords: 300
    },
    {
      id: 'script',
      label: 'The Script',
      icon: PenTool,
      description: "Write your screenplay in proper format.",
      prompt: "Slug lines, action, character, dialogue, parentheticals.",
      tips: [
        "📄 1 page = 1 minute of screen time",
        "✍️ Action: brief, visual, active",
        "💬 Dialogue: subtext over text",
        "🚫 No camera directions"
      ],
      celebration: "You wrote a screenplay! 🏆",
      minWords: 5000
    }
  ],
  webseries: [
    {
      id: 'idea',
      label: 'The Concept',
      icon: Lightbulb,
      description: "Web series thrive on unique, bingeable concepts.",
      prompt: "What's a world audiences will want to return to week after week?",
      tips: [
        "📺 Think episodic + serialized",
        "🔄 Renewable conflict that resets each episode",
        "💰 Budget-conscious locations",
        "🎯 Hook viewers in seconds"
      ],
      celebration: "This could trend! 📈",
      minWords: 30
    },
    {
      id: 'logline',
      label: 'The Hook',
      icon: Target,
      description: "Pitch your series in one compelling line.",
      prompt: "In [world], [protagonist] must [ongoing challenge] while [complication].",
      tips: [
        "🔄 Show ongoing conflict potential",
        "👥 Hint at ensemble dynamics",
        "🎭 Establish tone clearly",
        "📱 Social media shareable"
      ],
      celebration: "Audiences would subscribe! 📺",
      minWords: 20
    },
    {
      id: 'series-bible',
      label: 'The Bible',
      icon: BookOpen,
      description: "Create your series bible - the show's DNA.",
      prompt: "Define: tone, rules, visual style, audience, episode structure.",
      tips: [
        "📖 This is your reference document",
        "🎨 Include visual references",
        "📝 Episode format and length",
        "🔄 Season arcs + episode arcs"
      ],
      celebration: "Your show has a bible! 📚",
      minWords: 300
    },
    {
      id: 'characters',
      label: 'The Ensemble',
      icon: Users,
      description: "Build an ensemble audiences will love.",
      prompt: "Create distinct characters with conflicting wants and chemistry.",
      tips: [
        "🎭 Each character represents a viewpoint",
        "💬 Distinct voices and speech patterns",
        "🔗 Relationship dynamics drive episodes",
        "📈 Character arcs across seasons"
      ],
      celebration: "Fans will ship them! 💕",
      minWords: 200
    },
    {
      id: 'season-arc',
      label: 'The Season',
      icon: Clapperboard,
      description: "Plan your season's overarching story.",
      prompt: "What's the big question your season answers? What changes by the finale?",
      tips: [
        "📈 Build toward season finale",
        "🔄 Each episode contributes",
        "🎣 Cliffhangers and hooks",
        "💔 Midseason shift"
      ],
      celebration: "Season planned! 📅",
      minWords: 200
    },
    {
      id: 'episode-outlines',
      label: 'The Episodes',
      icon: FileText,
      description: "Outline each episode of your season.",
      prompt: "Episode [X]: Cold open, A/B/C stories, climax, tag/stinger.",
      tips: [
        "📺 3-5 minute episodes typical for web",
        "🎬 Strong cold opens",
        "🔗 B-stories for variety",
        "🎣 End on hooks"
      ],
      celebration: "Binge-ready! 🍿",
      minWords: 500
    }
  ],
  documentary: [
    {
      id: 'idea',
      label: 'The Subject',
      icon: Lightbulb,
      description: "What truth needs to be told? What story must be uncovered?",
      prompt: "What subject matter are you passionate about revealing to the world?",
      tips: [
        "🎬 Access is everything - can you film it?",
        "❓ What's the central question?",
        "👥 Who are your subjects?",
        "⏰ Is this timely or timeless?"
      ],
      celebration: "Your subject matters! 🎯",
      minWords: 50
    },
    {
      id: 'logline',
      label: 'The Angle',
      icon: Target,
      description: "Find your unique angle on the subject.",
      prompt: "This is a documentary about [subject] that reveals [insight] through [approach].",
      tips: [
        "🔍 What's YOUR perspective?",
        "🎭 Character-driven docs resonate",
        "💡 Fresh take on known subjects",
        "📺 Consider your audience"
      ],
      celebration: "Fresh perspective! 👁️",
      minWords: 30
    },
    {
      id: 'treatment',
      label: 'The Treatment',
      icon: FileText,
      description: "Write your documentary treatment for funders and collaborators.",
      prompt: "Describe your film: subject, approach, key characters, visual style, intended impact.",
      tips: [
        "📝 Include why YOU should make this",
        "🎨 Visual and tonal references",
        "👥 Key subjects and access",
        "🎯 Target audience and distribution"
      ],
      celebration: "Fundable treatment! 💰",
      minWords: 300
    },
    {
      id: 'characters',
      label: 'The Subjects',
      icon: Users,
      description: "Profile your documentary subjects.",
      prompt: "Who are the people who will tell this story? What's their journey?",
      tips: [
        "🎭 Subjects with compelling arcs",
        "🔗 Conflicting viewpoints add depth",
        "📞 Secure their participation",
        "💬 Great talkers or visual subjects"
      ],
      celebration: "Your subjects shine! 🌟",
      minWords: 150
    },
    {
      id: 'structure',
      label: 'The Structure',
      icon: Clapperboard,
      description: "Design your documentary's narrative structure.",
      prompt: "How will you organize this material? Chronological? Thematic? Character-driven?",
      tips: [
        "📐 Acts still apply to docs",
        "🔄 Weave multiple storylines",
        "🎬 Archival + interviews + verité",
        "📈 Build toward revelation"
      ],
      celebration: "Structured for impact! 🏗️",
      minWords: 200
    },
    {
      id: 'questions',
      label: 'The Questions',
      icon: Mic,
      description: "Prepare your interview questions.",
      prompt: "What questions will reveal the truth you're seeking?",
      tips: [
        "🎤 Open-ended questions",
        "💔 Emotional moments matter",
        "🔍 Follow-up on surprises",
        "🤫 Silence draws out truth"
      ],
      celebration: "Ready to interview! 🎙️",
      minWords: 200
    }
  ],
  podcast: [
    {
      id: 'idea',
      label: 'The Concept',
      icon: Lightbulb,
      description: "What's the audio story that needs to be heard?",
      prompt: "What story works best when listeners can imagine it themselves?",
      tips: [
        "🎧 Audio is intimate - lean into it",
        "🔊 Think about soundscapes",
        "🎭 Narrative + interview = powerful",
        "📻 What makes this perfect for podcast?"
      ],
      celebration: "This will sound amazing! 🔊",
      minWords: 40
    },
    {
      id: 'logline',
      label: 'The Pitch',
      icon: Target,
      description: "Hook listeners in one sentence.",
      prompt: "A podcast that explores [subject] through [approach], revealing [insight].",
      tips: [
        "🎯 Clear promise to listeners",
        "👂 Why would someone listen?",
        "🔄 Episodic potential clear",
        "📱 Shareable concept"
      ],
      celebration: "Subscribers incoming! 📲",
      minWords: 25
    },
    {
      id: 'format',
      label: 'The Format',
      icon: Volume2,
      description: "Design your podcast format and style.",
      prompt: "Define: length, structure, tone, host style, recurring elements.",
      tips: [
        "⏱️ 20-45 minutes sweet spot",
        "🎭 Solo, interview, or ensemble?",
        "🎵 Signature sounds and music",
        "📋 Consistent structure helps retention"
      ],
      celebration: "Format locked! 🔒",
      minWords: 150
    },
    {
      id: 'characters',
      label: 'The Voices',
      icon: Users,
      description: "Who speaks in your podcast? What perspectives?",
      prompt: "Define your hosts, guests, and subjects. What voices will listeners hear?",
      tips: [
        "🎤 Host personality matters",
        "👥 Expert vs. personal perspectives",
        "🔗 Chemistry between speakers",
        "💬 Diverse voices and viewpoints"
      ],
      celebration: "Great voices assembled! 🎙️",
      minWords: 100
    },
    {
      id: 'season-arc',
      label: 'The Arc',
      icon: BookOpen,
      description: "Plan your season's narrative journey.",
      prompt: "How does your season begin, develop, and conclude?",
      tips: [
        "📈 Build complexity over episodes",
        "🎣 Episode hooks drive binging",
        "💔 Emotional peaks and valleys",
        "🎯 Satisfying conclusion"
      ],
      celebration: "Story arc complete! 🌈",
      minWords: 200
    },
    {
      id: 'episodes',
      label: 'The Episodes',
      icon: FileText,
      description: "Outline each episode in detail.",
      prompt: "Episode [X]: Hook, segments, interview portions, conclusion, cliffhanger.",
      tips: [
        "🎬 Strong cold opens",
        "⏱️ Segment timing",
        "🔊 Sound design moments",
        "🎣 End with anticipation"
      ],
      celebration: "Ready to record! 🎚️",
      minWords: 400
    },
    {
      id: 'script',
      label: 'The Script',
      icon: PenTool,
      description: "Write your episode scripts.",
      prompt: "Write narration, interview questions, transitions, and sound cues.",
      tips: [
        "✍️ Write for the ear, not the eye",
        "🎵 [SFX] and [MUSIC] cues",
        "💬 Interview as conversation",
        "📖 Read aloud as you write"
      ],
      celebration: "Script ready! 📝",
      minWords: 1500
    }
  ]
};

// Writing prompts for when users are stuck
const STUCK_PROMPTS = [
  "What if the opposite happened?",
  "What's the worst thing that could happen here?",
  "What secret is someone hiding?",
  "What does your character fear most?",
  "What would they never do... until now?",
  "Who unexpected could walk through the door?",
  "What memory haunts them?",
  "What do they want more than anything?",
  "What lie are they telling themselves?",
  "Fast forward: what changed?"
];

export default function JourneyEditor({
  projectId,
  projectType,
  projectTitle,
  currentLanguage,
  initialData,
  onSave,
  onGenerate,
  onModeChange
}: JourneyEditorProps) {
  const steps = WORKFLOW_STEPS[projectType] || WORKFLOW_STEPS.shortfilm;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepContent, setStepContent] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [writingTime, setWritingTime] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [stuckPrompt, setStuckPrompt] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentStep = steps[currentStepIndex];
  const currentContent = stepContent[currentStep.id] || '';
  const progress = (completedSteps.size / steps.length) * 100;
  
  // Initialize with existing data
  useEffect(() => {
    const content: Record<string, string> = {};
    const completed = new Set<string>();
    
    if (initialData.idea) {
      content.idea = initialData.idea;
      if (initialData.idea.split(/\s+/).length >= 20) completed.add('idea');
    }
    if (initialData.logline) {
      content.logline = initialData.logline;
      if (initialData.logline.split(/\s+/).length >= 15) completed.add('logline');
    }
    if (initialData.treatment) {
      content.treatment = initialData.treatment;
      if (initialData.treatment.split(/\s+/).length >= 100) completed.add('treatment');
    }
    if (initialData.synopsis) {
      content.synopsis = initialData.synopsis;
      content.premise = initialData.synopsis;
    }
    if (initialData.theme) {
      content.theme = initialData.theme;
    }
    
    setStepContent(content);
    setCompletedSteps(completed);
    
    // Find first incomplete step
    const firstIncomplete = steps.findIndex(s => !completed.has(s.id));
    if (firstIncomplete !== -1) setCurrentStepIndex(firstIncomplete);
  }, [initialData, steps]);
  
  // Word count calculation
  useEffect(() => {
    const words = Object.values(stepContent).join(' ').split(/\s+/).filter(w => w.length > 0).length;
    setTotalWordCount(words);
  }, [stepContent]);
  
  // Writing timer
  useEffect(() => {
    if (isWriting) {
      timerRef.current = setInterval(() => {
        setWritingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWriting]);
  
  const handleContentChange = (value: string) => {
    setStepContent(prev => ({ ...prev, [currentStep.id]: value }));
    setIsWriting(true);
    
    // Check if step is now complete
    const wordCount = value.split(/\s+/).filter(w => w.length > 0).length;
    if (currentStep.minWords && wordCount >= currentStep.minWords && !completedSteps.has(currentStep.id)) {
      markStepComplete();
    }
    
    // Auto-stop writing detection after 3 seconds of no typing
    clearTimeout(timerRef.current!);
    timerRef.current = setTimeout(() => setIsWriting(false), 3000);
  };
  
  const markStepComplete = () => {
    if (completedSteps.has(currentStep.id)) return;
    
    setCompletedSteps(prev => new Set([...prev, currentStep.id]));
    setShowCelebration(true);
    setCurrentStreak(prev => prev + 1);
    
    // Fire confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => setShowCelebration(false), 3000);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(currentStep.id, currentContent);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await onGenerate(currentStep.id);
      setStepContent(prev => ({ ...prev, [currentStep.id]: generated }));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      handleSave();
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      handleSave();
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const getRandomPrompt = () => {
    const prompt = STUCK_PROMPTS[Math.floor(Math.random() * STUCK_PROMPTS.length)];
    setStuckPrompt(prompt);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const router = useRouter();
  
  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      focusMode ? "bg-black" : "bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900"
    )}>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              {/* Back to Dashboard Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white hover:bg-white/10"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              
              <div className="h-4 w-px bg-white/20" />
              
              <h1 className="text-lg font-semibold text-white truncate max-w-[200px]">
                {projectTitle}
              </h1>
              <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                {projectType.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span>{currentStreak} streak</span>
                </div>
                <div className="flex items-center gap-1 text-blue-400">
                  <FileText className="w-4 h-4" />
                  <span>{totalWordCount.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(writingTime)}</span>
                </div>
              </div>
              
              {/* Focus Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className={cn(
                  "text-gray-400 hover:text-white",
                  focusMode && "text-purple-400"
                )}
              >
                {focusMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="ml-1">{focusMode ? 'Exit Focus' : 'Focus'}</span>
              </Button>
              
              {/* Switch to Classic Mode */}
              {onModeChange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModeChange('classic')}
                  className="text-gray-400 border-white/20 hover:text-white hover:bg-white/10"
                >
                  Classic Mode
                </Button>
              )}
            </div>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              const isLocked = index > currentStepIndex + 1 && !isCompleted;
              
              return (
                <button
                  key={step.id}
                  onClick={() => !isLocked && setCurrentStepIndex(index)}
                  disabled={isLocked}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all duration-300",
                    isCompleted ? "bg-green-500" : 
                    isCurrent ? "bg-purple-500 animate-pulse" :
                    isLocked ? "bg-gray-800" : "bg-gray-700 hover:bg-gray-600"
                  )}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4"
                >
                  <currentStep.icon className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {currentStep.label}
                </h2>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                  {currentStep.description}
                </p>
              </div>
              
              {/* Writing Prompt Card */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 mb-6">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <MessageCircle className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-300 mb-1">Writing Prompt</p>
                      <p className="text-white text-lg italic">"{currentStep.prompt}"</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Main Textarea */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing here..."
                  className={cn(
                    "min-h-[300px] text-lg leading-relaxed bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none",
                    "focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
                    focusMode && "min-h-[500px] text-xl"
                  )}
                />
                
                {/* Word count indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm">
                  {currentStep.minWords && (
                    <span className={cn(
                      "transition-colors",
                      currentContent.split(/\s+/).filter(w => w).length >= currentStep.minWords
                        ? "text-green-400"
                        : "text-gray-500"
                    )}>
                      {currentContent.split(/\s+/).filter(w => w).length} / {currentStep.minWords} words
                    </span>
                  )}
                </div>
              </div>
              
              {/* Tips Section */}
              {!focusMode && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {currentStep.tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400"
                    >
                      {tip}
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Stuck? Section */}
              {!focusMode && (
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={getRandomPrompt}
                    className="text-gray-400 hover:text-purple-400"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Stuck? Get a prompt
                  </Button>
                  {stuckPrompt && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-purple-300 text-lg italic"
                    >
                      💡 {stuckPrompt}
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Celebration Overlay */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl text-center">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {currentStep.celebration}
                  </h3>
                  <p className="text-white/80">
                    Step {currentStepIndex + 1} complete
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Assist
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? 'Saving...' : 'Save Progress'}
              </Button>
            </div>
            
            <Button
              onClick={goToNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {completedSteps.has(currentStep.id) ? (
                <>
                  Continue
                  <Check className="w-5 h-5 ml-1" />
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
