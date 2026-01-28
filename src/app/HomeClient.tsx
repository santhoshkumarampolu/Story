'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sparkles, Languages, Users, Zap, ChevronRight, Play, Check, Trophy, Flame, Target, PartyPopper, NotebookPen, Rocket, Mic, Plus, Minus, HelpCircle } from "lucide-react";
import { WebsiteStructuredData, OrganizationStructuredData, FAQStructuredData } from "@/components/seo/StructuredData";

// Animation variants
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

export default function HomeClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is AI Story Studio?",
      answer: "AI Story Studio is an AI-powered platform that helps you create stories, screenplays, and scripts. It guides you step-by-step from idea to finished screenplay, providing AI assistance for characters, plot, and dialogue at every stage."
    },
    {
      question: "Which languages does AI Story Studio support?",
      answer: "We support 9 major languages: English, Hindi, Telugu, Tamil, Kannada, Malayalam, Spanish, French, and German. You can write in any of these languages, and our AI understands the specific cultural context and nuances of each."
    },
    {
      question: "Is AI Story Studio free to use?",
      answer: "Yes! We offer a generous free tier with 50,000 tokens per month, which is enough to create multiple short films or several story drafts. Pro plans are available for professional writers who need higher limits."
    },
    {
      question: "Can I use it without creating an account?",
      answer: "Yes, you can try our AI Dialogue Tool instantly without signing up. For full project management, Journey Mode, and saving your work, you'll need to create a free account."
    },
    {
      question: "Can I export my screenplay to industry formats?",
      answer: "Absolutely. You can export your scripts to PDF, Fountain (.fountain), and plain text. These formats are compatible with professional industry software like Final Draft."
    }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* SEO Structured Data */}
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <FAQStructuredData />
      
      {/* Subtle background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      <div className="relative">
        <Header />

        <main>
          {/* Hero Section - Clean & Bold */}
          <section className="relative min-h-[80vh] flex items-center justify-center px-4 pt-10 pb-6">
            <div className="container mx-auto max-w-5xl">
              <motion.div 
                className="flex flex-col items-center text-center"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                {/* Badge */}
                <motion.div 
                  variants={fadeInUp}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300"
                >
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Storytelling Platform
                </motion.div>

                {/* Main headline */}
                <motion.h1 
                  variants={fadeInUp}
                  className="font-outfit text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                >
                  Your guided journey to
                  <span className="block mt-2 text-purple-400">
                    storytelling mastery
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p 
                  variants={fadeInUp}
                  className="max-w-2xl text-lg sm:text-l text-white/60 mb-8"
                >
                  From spark to screenplay, guided step-by-step. Celebrate progress, unlock achievements, 
                  and let AI help you overcome every block.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
                >
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 text-base px-8 py-6 font-semibold rounded-full">
                      Start Writing Free
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <div className="relative group">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase tracking-widest z-10 shadow-lg border border-white/20">
                      No Login Required
                    </div>
                    <Link href="/dialogue-tool" className="block transform transition-transform group-hover:scale-105 active:scale-95">
                      <Button size="lg" variant="outline" className="border-indigo-500/60 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/20 text-base px-10 py-7 font-bold rounded-full border-2 backdrop-blur-sm">
                        <NotebookPen className="mr-2 h-5 w-5" />
                        Try AI Dialogue Tool
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Trust indicators */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/50"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Free tier available
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Multi-language support
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Feature 1 - Text Left, Visual Right */}
          <section className="relative py-10 px-4">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInLeft} className="space-y-6">
                  <div className="inline-flex items-center gap-2 text-purple-400 text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered Writing
                  </div>
                  <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Generate stories from a single idea
                  </h2>
                  <p className="text-lg text-white/60 leading-relaxed">
                    Start with a logline or concept. Our AI expands it into a full narrative structure—complete 
                    with characters, plot points, and scene breakdowns. No more staring at blank pages.
                  </p>
                  <ul className="space-y-3">
                    {["Instant character profiles", "Scene-by-scene breakdown", "Dialogue suggestions"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-white/70">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div 
                  variants={fadeInRight}
                  className="relative rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="rounded-xl p-8 min-h-[320px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-purple-400" />
                      </div>
                      <p className="text-white/40 text-sm">AI Story Generation Preview</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Feature 2 - Visual Left, Text Right */}
          <section className="relative py-12 px-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-y border-white/5">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div 
                  variants={fadeInLeft}
                  className="relative rounded-3xl border border-indigo-500/20 bg-black overflow-hidden shadow-2xl shadow-indigo-500/20 order-2 lg:order-1"
                >
                  <div className="rounded-xl p-8 min-h-[300px] bg-gradient-to-b from-transparent to-indigo-500/5">
                    <motion.div 
                      className="space-y-6 font-serif text-base md:text-lg opacity-90"
                      variants={staggerContainer}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                    >
                      <motion.div variants={fadeInUp} className="space-y-1">
                        <p className="font-bold text-indigo-500 text-sm tracking-widest uppercase">RAVI (రవి)</p>
                        <p className="text-white/90 leading-relaxed">Bagunnava? Script work enthavaraku vachindi?</p>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-1">
                        <p className="font-bold text-indigo-500 text-sm tracking-widest uppercase">KIRAN (కిరణ్)</p>
                        <p className="text-white/90 leading-relaxed">Yeah! Almost complete ayindi. This AI captures the context perfectly.</p>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="pt-6 border-t border-white/10 flex items-center justify-between">
                        <span className="italic text-white/40 text-sm">AI capturing Telgish/Hinglish...</span>
                        <Mic className="h-4 w-4 text-indigo-500 animate-pulse" />
                      </motion.div>
                    </motion.div>
                  </div>
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg">
                    Live Demo
                  </div>
                </motion.div>
                
                <motion.div variants={fadeInRight} className="space-y-5 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-medium">
                    <NotebookPen className="h-4 w-4" />
                    FREE & NO LOGIN REQUIRED
                  </div>
                  <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Instant AI Dialogue in <span className="text-indigo-500">9+ Languages</span>
                  </h2>
                  <p className="text-lg text-white/60 leading-relaxed">
                    Try our free AI Dialogue Tool—start generating instantly without an account. Now with Voice Dictation and support for Spanish, French, German, and major Indian languages.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "English, Spanish, French", 
                      "German, Hindi, Telugu", 
                      "Voice Commands Enabled", 
                      "No Signup Needed"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-white/70">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/dialogue-tool">
                    <Button size="lg" variant="secondary" className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-full px-8">
                      Try Free Instantly
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Feature 3 - Text Left, Visual Right */}
          <section className="relative py-10 px-4 bg-white/[0.02]">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInLeft} className="space-y-6">
                  <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <Languages className="h-4 w-4" />
                    Multi-Language Support
                  </div>
                  <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Write once, translate everywhere
                  </h2>
                  <p className="text-lg text-white/60 leading-relaxed">
                    Create in English, Hindi, or Spanish—then instantly translate to other supported languages 
                    without losing context, tone, or cultural nuance. Perfect for global audiences.
                  </p>
                  <ul className="space-y-3">
                    {["Context-aware translation", "Preserve emotional tone", "9 languages supported"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-white/70">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div 
                  variants={fadeInRight}
                  className="relative rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1"
                >
                  <div className="rounded-xl bg-black/80 p-8 min-h-[320px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Languages className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-white/40 text-sm">Multi-Language Translation</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* NEW: Journey Mode Feature Section */}
          <section className="relative py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="text-center mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="inline-flex items-center gap-2 text-amber-400 text-sm font-medium mb-4">
                  <Trophy className="h-4 w-4" />
                  Journey Mode - NEW
                </div>
                <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  Writing that feels like a game
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Our revolutionary Journey Mode transforms writing from a solitary struggle into 
                  an engaging adventure with progress tracking, celebrations, and AI guidance.
                </p>
              </motion.div>

              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {[
                  {
                    icon: Target,
                    title: "Step-by-Step Guidance",
                    description: "Follow a curated path from idea to finished script. Each step builds on the last.",
                    color: "purple"
                  },
                  {
                    icon: PartyPopper,
                    title: "Celebrate Progress",
                    description: "Confetti celebrations when you complete steps. Writing milestones feel rewarding.",
                    color: "pink"
                  },
                  {
                    icon: Trophy,
                    title: "Unlock Achievements",
                    description: "Earn badges for writing streaks, word counts, and completed projects.",
                    color: "amber"
                  },
                  {
                    icon: Flame,
                    title: "Writing Streaks",
                    description: "Build momentum with daily streaks. Stay motivated and consistent.",
                    color: "orange"
                  },
                  {
                    icon: NotebookPen,
                    title: "AI Writing Buddy",
                    description: "Stuck? Chat with your AI assistant for instant help, prompts, and feedback.",
                    color: "blue"
                  },
                  {
                    icon: Rocket,
                    title: "Focus Mode",
                    description: "Distraction-free writing environment. Just you and your story.",
                    color: "green"
                  }
                ].map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="relative group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* How It Works - Timeline Style */}
          <section id="how-it-works" className="relative py-10 px-4 bg-white/[0.02]">
            <div className="container mx-auto max-w-4xl">
              <motion.div 
                className="text-center mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  Your creative journey in 4 steps
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Our guided workflow takes you from first spark to finished screenplay, celebrating every milestone.
                </p>
              </motion.div>

              <motion.div 
                className="space-y-0"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {[
                  { step: "01", title: "Capture your spark", desc: "Start with any idea—a moment, a question, a 'what if.' We'll help you develop it.", emoji: "💡" },
                  { step: "02", title: "Build with guidance", desc: "Follow step-by-step prompts as AI generates characters, scenes, and structure.", emoji: "🏗️" },
                  { step: "03", title: "Write & celebrate", desc: "Complete each stage and celebrate with confetti! Earn achievements as you progress.", emoji: "🎉" },
                  { step: "04", title: "Polish & export", desc: "Refine with AI feedback, then export in industry-standard formats.", emoji: "✨" },
                ].map((item, index) => (
                  <motion.div 
                    key={item.step}
                    variants={fadeInUp}
                    className="relative flex gap-6 pb-12 last:pb-0"
                  >
                    {/* Timeline line */}
                    {index < 3 && (
                      <div className="absolute left-[23px] top-12 w-px h-full bg-gradient-to-b from-purple-500/50 to-transparent" />
                    )}
                    {/* Step number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                      {item.step}
                    </div>
                    {/* Content */}
                    <div className="pt-2">
                      <h3 className="text-xl font-bold mb-2">{item.emoji} {item.title}</h3>
                      <p className="text-white/60">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Coming Soon - Storyboard */}
          <section className="relative py-10 px-4 bg-gradient-to-b from-purple-900/10 to-transparent">
            <div className="container mx-auto max-w-4xl">
              <motion.div 
                className="text-center rounded-3xl border border-purple-500/20 bg-purple-500/5 p-12"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm text-purple-300 mb-6">
                  <Zap className="h-4 w-4" />
                  Coming Soon
                </div>
                <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">
                  Storyboard & Video Generation
                </h2>
                <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
                  Turn your scripts into visual storyboards and AI-generated video previews. 
                  See your story come to life before production.
                </p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 rounded-full">
                    Join Waitlist
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="relative py-24 px-4 overflow-hidden">
            <div className="container mx-auto max-w-4xl">
              <motion.div 
                className="text-center mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-medium mb-4">
                  <HelpCircle className="h-4 w-4" />
                  Common Questions
                </div>
                <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
                  Got questions? We have answers.
                </h2>
                <p className="text-lg text-white/60">
                  Everything you need to know about the AI Story Studio platform.
                </p>
              </motion.div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-4 ${
                        openFaq === index 
                        ? 'bg-white/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                    >
                      <span className={`text-lg font-semibold transition-colors duration-300 ${openFaq === index ? 'text-indigo-400' : 'text-white/90'}`}>
                        {faq.question}
                      </span>
                      <div className={`mt-1 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                        {openFaq === index ? (
                          <Minus className="h-5 w-5 text-indigo-400" />
                        ) : (
                          <Plus className="h-5 w-5 text-white/40 group-hover:text-white/60" />
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-2 text-white/60 leading-relaxed text-base">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative py-32 px-4">
            <div className="container mx-auto max-w-3xl text-center">
              <motion.div 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div 
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 px-4 py-2 text-sm text-purple-300 mb-6"
                >
                  <Sparkles className="h-4 w-4" />
                  Start your writing journey today
                </motion.div>
                <motion.h2 
                  variants={fadeInUp}
                  className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                >
                  Ready to transform how you write?
                </motion.h2>
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg text-white/60 mb-10"
                >
                  Join writers who&apos;ve discovered that creating stories can be as fun as reading them.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-base px-10 py-6 font-semibold rounded-full">
                      Start Your Journey Free
                      <Rocket className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.p 
                  variants={fadeInUp}
                  className="mt-6 text-sm text-white/40"
                >
                  No credit card required • Free tier forever • Upgrade anytime
                </motion.p>
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-white/10 py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-sm text-white/50">
                © 2026 AI Story Studio. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
