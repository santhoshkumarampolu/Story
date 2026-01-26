"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { NotebookPen, Sparkles, AlertCircle, Settings2, ShieldCheck, ChevronDown, ChevronUp, Lock, Mic, MicOff } from "lucide-react";
import { useTranslations, useTranslationsFor } from "@/components/TranslationProvider";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

interface DialogueToolLandingProps {
  language?: string;
}

export default function DialogueToolLanding({ language = "en" }: DialogueToolLandingProps) {
  const { data: session } = useSession();
  const { t } = useTranslationsFor('common');
  const [context, setContext] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic Theme Colors
  const stepThemes = {
    1: { 
      text: "text-[#00BCD4]", 
      bg: "bg-[#00BCD4]", 
      hover: "hover:bg-[#00ACC1]", 
      border: "border-[#B2EBF2]", 
      shadow: "shadow-[#00BCD4]/20",
      ring: "focus:ring-[#00BCD4]/30",
      lightBg: "bg-[#E0F7FA]",
      lightBorder: "border-[#B2EBF2]",
      softBg: "bg-[#00BCD4]/10",
      softBorder: "border-[#00BCD4]/20",
    },
    2: { 
      text: "text-violet-600", 
      bg: "bg-violet-600", 
      hover: "hover:bg-violet-700",
      border: "border-violet-200",
      shadow: "shadow-violet-500/20",
      ring: "focus:ring-violet-500/30",
      lightBg: "bg-violet-50",
      lightBorder: "border-violet-100",
      softBg: "bg-violet-500/10",
      softBorder: "border-violet-500/20",
    },
    3: { 
      text: "text-indigo-600", 
      bg: "bg-indigo-600", 
      hover: "hover:bg-indigo-700",
      border: "border-indigo-200",
      shadow: "shadow-indigo-500/20",
      ring: "focus:ring-indigo-500/30",
      lightBg: "bg-indigo-50",
      lightBorder: "border-indigo-100",
      softBg: "bg-indigo-500/10",
      softBorder: "border-indigo-500/20",
    }
  } as const;

  const activeTheme = stepThemes[currentStep as 1 | 2 | 3];

  const [tone, setTone] = useState("emotional");
  const [conflict, setConflict] = useState("medium");
  const [style, setStyle] = useState("casual");
  const [objective, setObjective] = useState("");
  const [beats, setBeats] = useState("");
  const [length, setLength] = useState("short");
  const [variationMode, setVariationMode] = useState(false);
  const [transliteration, setTransliteration] = useState(false);
  const [characters, setCharacters] = useState([
    { name: "", description: "" },
    { name: "", description: "" },
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleReset = () => {
    setContext("");
    setCharacters([{ name: "", description: "" }, { name: "", description: "" }]);
    setResult("");
    setCurrentStep(1);
    setObjective("");
    setBeats("");
    setAdditionalInstructions("");
  };

  const [listeningField, setListeningField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = (field: string, setter: (val: string | ((prev: string) => string)) => void) => {
    // If already listening to this field, stop it
    if (listeningField === field && recognitionRef.current) {
      recognitionRef.current.stop();
      setListeningField(null);
      return;
    }

    // If listening to another field, stop that one first
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // @ts-ignore
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    
    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 
                       language === 'te' ? 'te-IN' : 
                       language === 'ta' ? 'ta-IN' : 
                       language === 'kn' ? 'kn-IN' : 
                       language === 'ml' ? 'ml-IN' : 'en-US';
    
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListeningField(field);
      recognitionRef.current = recognition;
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setter((prev: string) => prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error !== 'no-speech') {
        toast.error("Voice recorder stopped: " + event.error);
      }
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const VoiceButton = ({ field, setter }: { field: string, setter: any }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 rounded-full transition-all ${listeningField === field ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'text-muted-foreground hover:bg-muted'}`}
      onClick={() => toggleListening(field, setter)}
      title={listeningField === field ? "Stop listening" : "Start dictating"}
    >
      {listeningField === field ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
    </Button>
  );

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      // Primary method: modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result);
        toast.success(t('dialogueTool.copySuccess'));
      } else {
        // Fallback method: textarea element
        const textArea = document.createElement("textarea");
        textArea.value = result;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success(t('dialogueTool.copySuccess'));
        } else {
          toast.error(t('dialogueTool.copyFailed'));
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error(t('dialogueTool.copyFailed'));
    }
  };

  const [usageInfo, setUsageInfo] = useState<{ used: number; total: number } | null>(null);
  const [guestCount, setGuestCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && !session) {
      const stored = localStorage.getItem('guest_usage_count');
      setGuestCount(stored ? parseInt(stored) : 0);
    }
  }, [session]);

  const fetchUsage = async () => {
    if (session?.user) {
      try {
        const res = await fetch('/api/user/usage');
        const data = await res.json();
        if (data.success) {
          setUsageInfo({
            used: data.usage.tokenUsageThisMonth,
            total: 12000
          });
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      }
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [session]);

  const handleCharacterChange = (idx: number, field: "name" | "description", value: string) => {
    setCharacters((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const addCharacter = () => {
    setCharacters((prev) => [...prev, { name: "", description: "" }]);
  };

  const removeCharacter = (idx: number) => {
    setCharacters((prev) => prev.length > 2 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim() || characters.filter(c => c.name.trim()).length < 2) {
      toast.error(t('dialogueTool.missingContext'));
      return;
    }

    // Guest limit check: Allow only 2 generations without login
    if (!session && guestCount >= 2) {
      toast.error("Limit reached for guest mode. Login to unlock 12,000 free tokens!", {
        duration: 6000,
        action: {
          label: "Login Now",
          onClick: () => window.location.href = "/auth/signin"
        }
      });
      return;
    }

    setLoading(true);
    setResult("");
    try {
      const response = await fetch("/api/dialogue-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          tone,
          length,
          language,
          characters: characters.filter(c => c.name.trim()),
          additionalInstructions: additionalInstructions.trim() || undefined,
          writingStyle: style,
          conflictIntensity: conflict,
          sceneObjective: objective,
          keyBeats: beats,
          variationMode,
          transliteration
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.dialogue.text);
        
        // Update guest count for non-logged in users
        if (!session) {
          const newCount = guestCount + 1;
          setGuestCount(newCount);
          localStorage.setItem('guest_usage_count', newCount.toString());
        } else {
          // Refresh database usage for logged in users
          fetchUsage();
        }
      } else if (data.error === 'token_limit_reached') {
        toast.error(t('dialogueTool.limitReached'), {
          duration: 8000,
          action: {
            label: t('dialogueTool.upgradeToPro'),
            onClick: () => window.location.href = "/dashboard/subscription"
          }
        });
      } else {
        toast.error(data.error || t('dialogueTool.generationError'));
      }
    } catch (err) {
      toast.error(t('dialogueTool.generationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`max-w-4xl mx-auto my-6 shadow-2xl border-purple-500/20 bg-background/95 backdrop-blur-md ${language !== 'en' ? 'font-serif' : ''}`}>
      <CardHeader className="border-b border-border/40 p-6 md:p-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 shadow-inner group">
              <NotebookPen className="h-7 w-7 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <CardTitle className={`text-2xl md:text-3xl font-space-grotesk tracking-tight transition-colors duration-500 ${activeTheme.text}`}>
                {t('dialogueTool.title')}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex h-2 w-2 rounded-full animate-pulse ring-4 transition-colors duration-500 ${currentStep === 1 ? 'bg-[#00BCD4] ring-[#00BCD4]/20' : 'bg-green-500 ring-green-500/20'}`}></span>
             <span className="text-[11px] font-bold text-muted-foreground  tracking-[0.2em]">Neural Engine Ready</span>
              </div>
            </div>
          </div>
          {usageInfo && usageInfo.used >= 10000 && (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[13px] font-bold shadow-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              {t('dialogueTool.usage')}: {usageInfo.used.toLocaleString()} / {usageInfo.total.toLocaleString()}
            </div>
          )}
          {!session && (
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-[13px] font-bold shadow-sm transition-all duration-500 ${activeTheme.softBg} ${activeTheme.softBorder} ${activeTheme.text}`}>
              <Lock className="h-3.5 w-3.5" />
              Guest Mode: {guestCount}/2 Free Used
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mt-4 max-w-2xl">
          {t('dialogueTool.subtitle')}
        </p>
        {!session && guestCount >= 1 && (
          <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between transition-all duration-500 ${activeTheme.lightBg} ${activeTheme.lightBorder}`}>
            <span className={`text-xs font-medium ${activeTheme.text}`}>Enjoying the tool? Login to unlock 12,000 tokens per month!</span>
            <button 
              onClick={() => window.location.href = "/auth/signin"}
              className={`text-[13px] font-bold text-white px-3 py-1.5 rounded-lg transition-colors ${activeTheme.bg} ${activeTheme.hover}`}
            >
              Sign Up Free
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-5 md:p-8 pt-6">
        {/* Stepper Header */}
        <div className="mb-8 relative px-4">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 border-2 ${
                    currentStep >= step 
                      ? `${activeTheme.bg} text-white border-transparent ${activeTheme.shadow} scale-110` 
                      : "bg-background text-muted-foreground border-border/60"
                  }`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                <span className={`text-[13px] font-black  tracking-[0.15em] mt-2 ${currentStep >= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {step === 1 ? "Scene" : step === 2 ? "Style" : "Players"}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-4.5 left-0 w-full h-[1.5px] bg-muted -z-0">
            <div 
              className={`h-full transition-all duration-700 ${activeTheme.bg}`}
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative overflow-visible">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80 flex items-center gap-1">
                        {t('dialogueTool.sceneContext')} <span className="text-rose-500">*</span>
                      </label>
                      <VoiceButton field="context" setter={setContext} />
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`text-[13px] font-bold px-2 py-0.5 rounded-full border border-border/40 tracking-tighter transition-colors duration-500 ${
                         context.trim().length >= 10 
                           ? 'text-[#00BCD4] bg-[#E0F7FA]' 
                           : 'text-rose-500 bg-rose-50'
                       }`}>
                        {context.trim().length}/10 Min
                      </span>
                      <span className="text-[13px] font-bold text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full border border-border/40  tracking-tighter">Required</span>
                    </div>
                  </div>
                  <Textarea
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    placeholder={t('dialogueTool.sceneContextPlaceholder')}
                    required
                    minLength={10}
                    className={`mt-1 min-h-[120px] text-base leading-relaxed md:leading-normal resize-y focus:ring-2 focus:ring-indigo-500/30 border-border/60 bg-muted/5 placeholder:text-muted-foreground/30 placeholder:text-sm ${language !== 'en' ? 'text-lg' : ''} shadow-sm rounded-xl`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                        {t('dialogueTool.objective')}
                      </label>
                      <VoiceButton field="objective" setter={setObjective} />
                    </div>
                    <Textarea
                      placeholder={t('dialogueTool.objectivePlaceholder')}
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="min-h-[80px] text-sm bg-muted/5 border-border/60 placeholder:text-muted-foreground/30 resize-none focus:ring-2 focus:ring-purple-500/20 rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                        {t('dialogueTool.beats')}
                      </label>
                      <VoiceButton field="beats" setter={setBeats} />
                    </div>
                    <Textarea
                      placeholder={t('dialogueTool.beatsPlaceholder')}
                      value={beats}
                      onChange={(e) => setBeats(e.target.value)}
                      className="min-h-[80px] text-sm bg-muted/5 border-border/60 placeholder:text-muted-foreground/30 resize-none focus:ring-2 focus:ring-purple-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => context.trim().length >= 10 ? setCurrentStep(2) : toast.error("Please describe your scene (min 10 chars)")}
                    className={`h-12 px-8 rounded-xl text-white font-bold tracking-widest transition-all shadow-lg active:scale-95 ${activeTheme.bg} ${activeTheme.hover}`}
                  >
                    Continue →
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                  <div className="space-y-3">
                    <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                      {t('dialogueTool.tone')}
                    </label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className={`w-full h-12 border-border/60 bg-muted/10 text-sm rounded-xl shadow-sm focus:ring-2 transition-all ${activeTheme.ring}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] rounded-xl border-border/60">
                        {['emotional', 'comedy', 'love', 'witty', 'dramatic', 'action', 'suspense'].map(tValue => (
                          <SelectItem key={tValue} value={tValue} className="py-2.5 text-sm">{t(`dialogueTool.tones.${tValue}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                      {t('dialogueTool.conflict')}
                    </label>
                    <Select value={conflict} onValueChange={setConflict}>
                      <SelectTrigger className={`w-full h-12 border-border/60 bg-muted/10 text-sm rounded-xl shadow-sm focus:ring-2 transition-all ${activeTheme.ring}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60">
                        {['low', 'medium', 'high'].map(cValue => (
                          <SelectItem key={cValue} value={cValue} className="py-2.5 text-sm">{t(`dialogueTool.conflicts.${cValue}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                      {t('dialogueTool.writingStyle')}
                    </label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className={`w-full h-12 border-border/60 bg-muted/10 text-sm rounded-xl shadow-sm focus:ring-2 transition-all ${activeTheme.ring}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60">
                        {['casual', 'formal', 'poetic', 'tarantino'].map(sValue => (
                          <SelectItem key={sValue} value={sValue} className="py-2.5 text-sm">{t(`dialogueTool.styles.${sValue}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                      {t('dialogueTool.length')}
                    </label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger className={`w-full h-12 border-border/60 bg-muted/10 text-sm rounded-xl shadow-sm focus:ring-2 transition-all ${activeTheme.ring}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60">
                        {['short', 'medium', 'long'].map(lValue => (
                          <SelectItem key={lValue} value={lValue} className="py-2.5 text-sm">{t(`dialogueTool.lengths.${lValue}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-6 border-t border-border/40">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/5 border border-border/20 flex-1 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => setVariationMode(!variationMode)}
                      className={`relative mt-1 inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-all ${variationMode ? `${activeTheme.bg} shadow-sm` : 'bg-muted'}`}
                    >
                      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background transition-transform ${variationMode ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                    <div className="grid gap-1 leading-none">
                      <label className="text-[13px] font-bold leading-none cursor-pointer select-none">{t('dialogueTool.variationMode')}</label>
                      <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">{t('dialogueTool.variationDesc')}</p>
                    </div>
                  </div>

                  {language !== 'en' && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/5 border border-border/20 flex-1 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => setTransliteration(!transliteration)}
                        className={`relative mt-1 inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-all ${transliteration ? `${activeTheme.bg} shadow-sm` : 'bg-muted'}`}
                      >
                        <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background transition-transform ${transliteration ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <div className="grid gap-1 leading-none">
                        <label className="text-[13px] font-bold leading-none cursor-pointer select-none">{t('dialogueTool.transliteration')}</label>
                        <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">{t('dialogueTool.transliterationDesc')}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between gap-4">
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => setCurrentStep(1)}
                    className="h-12 px-6 rounded-xl text-[13px] font-black  tracking-widest text-muted-foreground hover:bg-muted"
                  >
                    ← Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep(3)}
                    className={`h-12 px-8 rounded-xl text-white font-bold tracking-widest transition-all shadow-lg active:scale-95 ${activeTheme.bg} ${activeTheme.hover} ${activeTheme.shadow}`}
                  >
                    Continue →
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                      {t('dialogueTool.characters')}
                    </label>
                    <span className="text-[13px] font-bold text-muted-foreground/60 tracking-wider">MINIMUM 2 PLAYERS</span>
                  </div>
                  <div className="grid gap-4">
                    {characters.map((char, idx) => (
                      <div key={idx} className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-border/40 bg-muted/5 transition-all hover:bg-muted/10 hover:border-pink-500/30">
                        <div className="flex-1 space-y-2">
                          <label className="text-[13px] font-black  tracking-[0.1em] text-muted-foreground/40 ml-1 flex items-center gap-1">
                            Name <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            value={char.name}
                            onChange={e => handleCharacterChange(idx, "name", e.target.value)}
                            placeholder={t('dialogueTool.characterName')}
                            className={`h-11 bg-background text-sm border-border/40 transition-all rounded-xl shadow-sm ${activeTheme.ring}`}
                            required
                          />
                        </div>
                        <div className="flex-[2] space-y-2">
                          <label className="text-[13px] font-black  tracking-[0.1em] text-muted-foreground/40 ml-1">Description</label>
                          <Input
                            value={char.description}
                            onChange={e => handleCharacterChange(idx, "description", e.target.value)}
                            placeholder={t('dialogueTool.characterDescription')}
                            className={`h-11 bg-background text-sm border-border/40 transition-all rounded-xl shadow-sm ${activeTheme.ring}`}
                          />
                        </div>
                        {characters.length > 2 && (
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="ghost" 
                            className="absolute -right-2 -top-2 md:relative md:right-0 md:top-7 h-8 w-8 rounded-full bg-background border border-border/40 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => removeCharacter(idx)}
                          >✕</Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addCharacter} className="w-full border-dashed h-12 rounded-xl text-[13px] font-black  tracking-[0.15em] text-muted-foreground hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/5">
                    + {t('dialogueTool.addCharacter')}
                  </Button>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-black  tracking-[0.15em] text-muted-foreground/80">
                      {t('dialogueTool.additionalInstructions')} <span className="opacity-40 font-normal lowercase tracking-normal ml-1">(Optional)</span>
                    </label>
                    <VoiceButton field="additionalInstructions" setter={setAdditionalInstructions} />
                  </div>
                  <Textarea
                    value={additionalInstructions}
                    onChange={e => setAdditionalInstructions(e.target.value)}
                    placeholder={t('dialogueTool.additionalInstructionsPlaceholder')}
                    className={`mt-1 min-h-[80px] text-sm leading-relaxed focus:ring-2 focus:ring-purple-500/20 border-border/60 bg-muted/5 placeholder:text-muted-foreground/30 rounded-xl shadow-sm`}
                  />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex justify-between gap-4">
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={() => setCurrentStep(2)}
                      className="h-12 px-6 rounded-xl text-[13px] font-black  tracking-widest text-muted-foreground hover:bg-muted"
                    >
                      ← Back
                    </Button>
                    <Button 
                      type="submit" 
                      className={`flex-1 h-14 text-sm font-black  tracking-[0.2em] text-white transition-all active:scale-[0.98] disabled:opacity-70 group rounded-2xl ${activeTheme.bg} ${activeTheme.hover} ${activeTheme.shadow}`} 
                      disabled={loading || characters.filter(c => c.name).length < 2}
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/20 border-t-white" />
                          <span>{t('dialogueTool.generating')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 group-hover:scale-105 transition-transform">
                          <Sparkles className="h-5 w-5 fill-white/20" />
                          <span>{t('dialogueTool.generateDialogue')}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {result && (
          <div ref={resultRef} className="mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full animate-pulse ${activeTheme.bg}`} />
                <label className="text-[11px] font-black  tracking-[0.4em] text-muted-foreground">
                  {t('dialogueTool.generatedDialogue')}
                </label>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  onClick={handleReset}
                  className="h-12 px-6 rounded-xl text-[13px] font-black  tracking-[0.2em] text-muted-foreground hover:bg-muted transition-all"
                >
                  Clear & Reset
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className={`h-12 px-8 text-[11px] font-black tracking-[0.2em] border border-border/60 bg-background transition-all shadow-sm rounded-xl ${activeTheme.text} hover:${activeTheme.lightBg} hover:${activeTheme.text}`}
                  onClick={handleCopy}
                >
                  {t('dialogueTool.copyDialogue')}
                </Button>
              </div>
            </div>
            <div className={`relative rounded-[40px] border-2 border-border/60 bg-muted/10 p-10 md:p-16 shadow-2xl overflow-hidden group`}>
               {/* Background pattern */}
              <div className={`absolute inset-0 opacity-[0.05] pointer-events-none [background-size:24px_24px] group-hover:opacity-[0.08] transition-opacity ${currentStep === 1 ? 'bg-[radial-gradient(#10b981_1px,transparent_1px)]' : currentStep === 2 ? 'bg-[radial-gradient(#8b5cf6_1px,transparent_1px)]' : 'bg-[radial-gradient(#4f46e5_1px,transparent_1px)]'}`}></div>
              
              <pre className={`relative whitespace-pre-wrap font-serif text-xl leading-[2.2] md:text-2xl text-foreground selection:bg-indigo-500/30 break-words ${language !== 'en' ? 'font-medium' : ''}`}>
                {result}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
