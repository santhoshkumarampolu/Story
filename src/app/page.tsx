'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
};

// Icon Components
const WorkflowIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const LanguageIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 5h12M9 3v18M5 21h14" />
  </svg>
);

const AIIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
  </svg>
);

const CollaborationIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LoglineIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const StructureIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const WriteIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ExportIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const StoryboardIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

// Data arrays
const valueProps = [
  {
    title: "Structured Workflow",
    description: "Build your story step-by-step with ease",
    icon: WorkflowIcon,
  },
  {
    title: "Multi-Language Support",
    description: "Write and translate into six languages instantly",
    icon: LanguageIcon,
  },
  {
    title: "AI Assistance",
    description: "Get smart suggestions for plots, characters, and dialogue",
    icon: AIIcon,
  },
  {
    title: "Real-Time Collaboration",
    description: "Work with your team seamlessly",
    icon: CollaborationIcon,
  },
];

const workflowSteps = [
  {
    title: "Start with a Logline",
    description: "Input a sentence, and AI suggests key elements",
    icon: LoglineIcon,
  },
  {
    title: "Build Your Structure",
    description: "Use templates to generate scenes",
    icon: StructureIcon,
  },
  {
    title: "Write & Refine",
    description: "Craft dialogue with AI-powered tone adjustments",
    icon: WriteIcon,
  },
  {
    title: "Export & Share",
    description: "Download or share your work instantly",
    icon: ExportIcon,
  },
];

const features = [
  {
    title: "AI Story Generator",
    description: "Overcome writer's block with creative prompts",
    icon: AIIcon,
  },
  {
    title: "Multi-Language Translation",
    description: "Translate scripts without losing context",
    icon: LanguageIcon,
  },
  {
    title: "Storyboard Visualization",
    description: "Turn scenes into visual shot descriptions",
    icon: StoryboardIcon,
  },
];

const stats = [
  {
    value: "10,000+",
    label: "Stories Created",
  },
  {
    value: "6+",
    label: "Languages Supported",
  },
  {
    value: "24/7",
    label: "AI Assistance",
  },
  {
    value: "100%",
    label: "Satisfaction",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <div className="relative">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-32">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="flex flex-col items-center text-center space-y-12"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <motion.h1 
                  className="font-space-grotesk text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]"
                  variants={fadeInUp}
                >
                  <span className="block pb-2">Craft Your Masterpiece</span>
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
                    with AI-Powered Storytelling
                  </span>
                </motion.h1>
                <motion.p 
                  className="max-w-2xl text-lg sm:text-xl text-white/70 font-inter"
                  variants={fadeInUp}
                >
                  Story Studio is the ultimate AI-driven platform for writers and filmmakers to create, 
                  structure, and translate stories across languages—effortlessly.
                </motion.p>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                  variants={fadeInUp}
                >
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 font-medium">
                      Start Your Free Trial
                    </Button>
                  </Link>
                  <Link href="#demo">
                    <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-lg px-8 py-6 font-medium">
                      Watch Demo
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Value Proposition Section */}
          <section className="relative py-24 px-4">
            <div className="container mx-auto max-w-7xl">
              <motion.div 
                className="text-center space-y-4 mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl font-bold"
                  variants={fadeInUp}
                >
                  Why Choose Story Studio?
                </motion.h2>
                <motion.p 
                  className="text-white/70 max-w-3xl mx-auto text-lg"
                  variants={fadeInUp}
                >
                  Say goodbye to scattered tools and endless revisions. Story Studio is your all-in-one 
                  solution for crafting compelling narratives, from concept to final draft, in any language.
                </motion.p>
              </motion.div>
              <motion.div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {valueProps.map((prop) => (
                  <motion.div
                    key={prop.title}
                    className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-purple-400/30 overflow-hidden"
                    variants={scaleIn}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <div className="p-8 h-full flex flex-col items-center text-center">
                      <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-400/20">
                        <prop.icon className="h-12 w-12 text-purple-400" />
                      </div>
                      <h3 className="font-space-grotesk text-xl font-bold mb-4 text-white leading-tight">
                        {prop.title}
                      </h3>
                      <p className="text-base text-white/70 leading-relaxed flex-grow flex items-center">
                        {prop.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="relative py-32 px-4">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="text-center space-y-4 mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl font-bold"
                  variants={fadeInUp}
                >
                  From Idea to Screenplay in Minutes
                </motion.h2>
              </motion.div>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {workflowSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl p-10 border border-white/10 h-[320px] flex flex-col"
                    variants={fadeInUp}
                  >
                    <div className="mb-8">
                      <step.icon className="h-12 w-12 text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-6">{step.title}</h3>
                    <p className="text-xl text-white/70 flex-grow">{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="relative py-32 px-4">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="text-center space-y-4 mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl font-bold"
                  variants={fadeInUp}
                >
                  Everything You Need to Tell Your Story
                </motion.h2>
              </motion.div>
              <motion.div 
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    className="group relative rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm transition-all hover:bg-white/10 h-[320px] flex flex-col"
                    variants={scaleIn}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="space-y-6">
                      <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        whileInView={{ rotate: 0, opacity: 1 }}
                        viewport={{ once: true }}
                      >
                        <feature.icon className="h-14 w-14 text-purple-400" />
                      </motion.div>
                      <h3 className="font-space-grotesk text-3xl font-bold">{feature.title}</h3>
                      <p className="text-xl text-white/70">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Social Proof Section */}
          <section className="relative py-32 px-4 bg-white/5">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="text-center space-y-4 mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl font-bold"
                  variants={fadeInUp}
                >
                  Join Our Growing Community
                </motion.h2>
              </motion.div>
              <motion.div 
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    variants={scaleIn}
                  >
                    <motion.p 
                      className="font-space-grotesk text-4xl font-bold text-purple-400"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-white/70">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="relative py-32 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <motion.div 
                className="space-y-8"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl font-bold"
                  variants={fadeInUp}
                >
                  Ready to Bring Your Story to Life?
                </motion.h2>
                <motion.p 
                  className="text-lg text-white/70"
                  variants={fadeInUp}
                >
                  Join thousands of creators using Story Studio to write, collaborate, and captivate.
                </motion.p>
                <motion.div 
                  className="flex justify-center"
                  variants={fadeInUp}
                >
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 font-medium">
                      Sign Up for Free
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </main>

        <footer className="relative border-t border-white/10 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-white/70">
                Built with ❤️ by AI Story Studio. All rights reserved.
              </p>
            </div>
          </div>
      </footer>
      </div>
    </div>
  );
}
