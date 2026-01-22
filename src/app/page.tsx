'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sparkles, Languages, Users, Zap, ChevronRight, Play, Check } from "lucide-react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Subtle background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      <div className="relative">
        <Header />

        <main>
          {/* Hero Section - Clean & Bold */}
          <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-10 pb-10">
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
                  className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300"
                >
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Storytelling Platform
                </motion.div>

                {/* Main headline */}
                <motion.h1 
                  variants={fadeInUp}
                  className="font-space-grotesk text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                >
                  Write stories that
                  <span className="block mt-2 text-purple-400">
                    captivate audiences
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p 
                  variants={fadeInUp}
                  className="max-w-2xl text-lg sm:text-xl text-white/60 mb-10"
                >
                  From idea to screenplay in minutes. AI Story Studio helps writers and filmmakers 
                  create, structure, and translate compelling narratives.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 mb-16"
                >
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 text-base px-8 py-6 font-semibold rounded-full">
                      Start Writing Free
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-base px-8 py-6 font-medium rounded-full">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Button>
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

          {/* Stats Bar - Simple inline */}
          {/* <section className="relative py-12 border-y border-white/10 bg-white/[0.02]">
            <div className="container mx-auto max-w-5xl px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "10K+", label: "Stories Created" },
                  { value: "6", label: "Languages" },
                  { value: "50K+", label: "Scenes Generated" },
                  { value: "4.9", label: "User Rating" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section> */}

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
                  <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
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
          <section className="relative py-10 px-4 bg-white/[0.02]">
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
                  className="relative rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1 order-2 lg:order-1"
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
                <motion.div variants={fadeInRight} className="space-y-6 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <Languages className="h-4 w-4" />
                    Multi-Language Support
                  </div>
                  <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Write once, translate everywhere
                  </h2>
                  <p className="text-lg text-white/60 leading-relaxed">
                    Create in English, Hindi, or Telugu—then instantly translate to other supported languages 
                    without losing context, tone, or cultural nuance. Perfect for global audiences.
                  </p>
                  <ul className="space-y-3">
                    {["Context-aware translation", "Preserve emotional tone", "6+ languages supported"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-white/70">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* How It Works - Timeline Style */}
          <section className="relative py-10 px-4">
            <div className="container mx-auto max-w-4xl">
              <motion.div 
                className="text-center mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  Idea to screenplay in 4 steps
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Our streamlined workflow gets you from concept to production-ready script faster than ever.
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
                  { step: "01", title: "Start with an idea", desc: "Enter a logline, concept, or just a spark of inspiration" },
                  { step: "02", title: "AI builds your structure", desc: "Get characters, scenes, and plot points generated instantly" },
                  { step: "03", title: "Write & refine", desc: "Edit with AI suggestions for dialogue, pacing, and tone" },
                  { step: "04", title: "Export & share", desc: "Download in industry-standard formats or share with collaborators" },
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
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
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
                <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
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

          {/* Final CTA */}
          <section className="relative py-32 px-4">
            <div className="container mx-auto max-w-3xl text-center">
              <motion.div 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  variants={fadeInUp}
                  className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                >
                  Ready to write your next masterpiece?
                </motion.h2>
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg text-white/60 mb-10"
                >
                  Join thousands of writers and filmmakers using AI Story Studio.
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 text-base px-10 py-6 font-semibold rounded-full">
                      Get Started Free
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
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
