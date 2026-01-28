'use client';

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ArrowLeft, Mail, MessageSquare, Clock, Send, Plus, Minus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactClient() {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open mailto link with pre-filled content
    const mailtoLink = `mailto:support@aistorystudio.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      <div className="relative">
        <Header />

        <main className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left Column - Info */}
              <div>
                <h1 className="font-outfit text-4xl sm:text-5xl font-bold mb-6">
                  Get in Touch
                </h1>
                <p className="text-lg text-white/60 mb-12">
                  Have questions, feedback, or need help? We&apos;d love to hear from you. 
                  Our team typically responds within 24 hours.
                </p>

                <div className="space-y-8">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                      <a 
                        href="mailto:support@aistorystudio.com" 
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        support@aistorystudio.com
                      </a>
                      <p className="text-sm text-white/50 mt-1">
                        For general inquiries and support
                      </p>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Response Time</h3>
                      <p className="text-white/70">Within 24 hours</p>
                      <p className="text-sm text-white/50 mt-1">
                        Monday to Friday, 9am - 6pm IST
                      </p>
                    </div>
                  </div>

                  {/* FAQ */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Common Questions</h3>
                      <button 
                        onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-white/70 hover:text-indigo-400 transition-colors text-left"
                      >
                        Check our FAQ for quick answers
                      </button>
                      <p className="text-sm text-white/50 mt-1">
                        Billing, features, and account help
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <Send className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Message Ready!</h3>
                    <p className="text-white/60 mb-6">
                      Your email client should open with your message. If it didn&apos;t, 
                      please email us directly at{" "}
                      <a 
                        href="mailto:support@aistorystudio.com" 
                        className="text-purple-400 hover:text-purple-300"
                      >
                        support@aistorystudio.com
                      </a>
                    </p>
                    <Button 
                      onClick={() => setSubmitted(false)}
                      variant="outline" 
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                        Subject
                      </label>
                      <select
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                      >
                        <option value="" className="bg-black">Select a topic</option>
                        <option value="General Inquiry" className="bg-black">General Inquiry</option>
                        <option value="Technical Support" className="bg-black">Technical Support</option>
                        <option value="Billing Question" className="bg-black">Billing Question</option>
                        <option value="Feature Request" className="bg-black">Feature Request</option>
                        <option value="Bug Report" className="bg-black">Bug Report</option>
                        <option value="Partnership" className="bg-black">Partnership</option>
                        <option value="Other" className="bg-black">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-white text-black hover:bg-white/90 py-6 rounded-lg font-semibold"
                    >
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-xs text-white/40 text-center">
                      By submitting, you agree to our{" "}
                      <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* FAQ Section */}
            <div id="faq" className="mt-32 max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-medium mb-4">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </div>
                <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">
                  Quick Answers
                </h2>
                <p className="text-lg text-white/60">
                  Find fast solutions to common questions before reaching out.
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
          </div>
        </main>

        <footer className="relative border-t border-white/10 py-12 mt-16">
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
