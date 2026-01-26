'use client';

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ArrowLeft } from "lucide-react";

export default function TermsClient() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      <div className="relative">
        <Header />

        <main className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="font-outfit text-4xl sm:text-5xl font-bold mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/70">
              <p className="text-white/60 text-sm">
                Last updated: January 22, 2026
              </p>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using AI Story Studio (&quot;the Service&quot;), you agree to be bound by these 
                  Terms of Service. If you do not agree to these terms, please do not use our Service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">2. Description of Service</h2>
                <p>
                  AI Story Studio is an AI-powered platform that helps writers and filmmakers create, 
                  structure, and translate stories, scripts, and screenplays. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI-assisted story generation and development</li>
                  <li>Character and scene creation tools</li>
                  <li>Multi-language translation capabilities</li>
                  <li>Script formatting and export features</li>
                  <li>Collaborative project management</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">3. Account Registration</h2>
                <p>To use certain features, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">4. Subscription and Payment</h2>
                <h3 className="text-xl font-semibold text-white/90">4.1 Free Tier</h3>
                <p>
                  We offer a free tier with limited features and usage quotas. Free tier users receive 
                  a monthly allocation of AI tokens that reset each billing cycle.
                </p>

                <h3 className="text-xl font-semibold text-white/90">4.2 Pro Subscription</h3>
                <p>
                  Pro subscriptions provide expanded features and higher usage limits. Payment is 
                  processed through Razorpay. Subscriptions auto-renew unless cancelled.
                </p>

                <h3 className="text-xl font-semibold text-white/90">4.3 Refunds</h3>
                <p>
                  Refund requests are handled on a case-by-case basis. Contact support within 7 days 
                  of purchase for refund consideration.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">5. User Content</h2>
                <h3 className="text-xl font-semibold text-white/90">5.1 Ownership</h3>
                <p>
                  You retain all rights to the content you create using AI Story Studio. Your stories, 
                  scripts, characters, and creative works belong to you.
                </p>

                <h3 className="text-xl font-semibold text-white/90">5.2 License to Us</h3>
                <p>
                  By using our Service, you grant us a limited license to process, store, and display 
                  your content solely for the purpose of providing the Service to you.
                </p>

                <h3 className="text-xl font-semibold text-white/90">5.3 Prohibited Content</h3>
                <p>You may not use our Service to create content that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Is illegal, harmful, or violates others&apos; rights</li>
                  <li>Contains hate speech, harassment, or discrimination</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains malware or malicious code</li>
                  <li>Violates any applicable laws or regulations</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">6. AI-Generated Content</h2>
                <p>
                  Content generated by our AI tools is created based on your prompts and inputs. While 
                  we strive for quality, we do not guarantee that AI-generated content will be:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Free from errors or inaccuracies</li>
                  <li>Suitable for any particular purpose</li>
                  <li>Original or free from similarity to existing works</li>
                </ul>
                <p>
                  You are responsible for reviewing and editing AI-generated content before use.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">7. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Attempt to bypass usage limits or security measures</li>
                  <li>Use automated systems to access the Service without permission</li>
                  <li>Interfere with the Service&apos;s operation or other users&apos; access</li>
                  <li>Reverse engineer or attempt to extract our source code</li>
                  <li>Use the Service for any illegal purpose</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">8. Intellectual Property</h2>
                <p>
                  AI Story Studio, including its design, features, and technology, is protected by 
                  intellectual property laws. You may not copy, modify, or distribute our platform 
                  without permission.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">9. Disclaimers</h2>
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL 
                  WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                  PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">10. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, AI STORY STUDIO SHALL NOT BE LIABLE FOR ANY 
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR 
                  USE OF THE SERVICE.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">11. Termination</h2>
                <p>
                  We may suspend or terminate your account if you violate these Terms. You may also 
                  delete your account at any time. Upon termination, your right to use the Service 
                  ceases immediately.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">12. Changes to Terms</h2>
                <p>
                  We may modify these Terms at any time. We will notify you of significant changes 
                  via email or through the Service. Continued use after changes constitutes acceptance.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">13. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of India. Any disputes shall be resolved in 
                  the courts of Hyderabad, Telangana.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">14. Contact</h2>
                <p>
                  For questions about these Terms, contact us at:
                </p>
                <p className="text-white">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:support@aistorystudio.com" className="text-purple-400 hover:text-purple-300">
                    support@aistorystudio.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </main>

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
