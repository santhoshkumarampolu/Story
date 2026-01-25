'use client';

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ArrowLeft } from "lucide-react";

export default function PrivacyClient() {
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

            <h1 className="font-space-grotesk text-4xl sm:text-5xl font-bold mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/70">
              <p className="text-white/60 text-sm">
                Last updated: January 22, 2026
              </p>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
                <p>
                  Welcome to AI Story Studio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting 
                  your privacy and ensuring the security of your personal information. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use our 
                  AI-powered storytelling platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-white/90">2.1 Personal Information</h3>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Profile picture (if provided)</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                  <li>Authentication data from Google OAuth (if used)</li>
                </ul>

                <h3 className="text-xl font-semibold text-white/90">2.2 Usage Information</h3>
                <p>We automatically collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Stories, scripts, and content you create</li>
                  <li>Token usage and AI generation history</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">3. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our AI storytelling services</li>
                  <li>Process your transactions and manage your subscription</li>
                  <li>Send you important updates and notifications</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">4. AI and Your Content</h2>
                <p>
                  When you use our AI features, your prompts and content are processed by our AI providers 
                  (OpenAI and Google Generative AI). We do not use your creative content to train AI models. 
                  Your stories and scripts remain your intellectual property.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">5. Data Sharing</h2>
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> Third-party services that help us operate (Cloudinary for images, Razorpay for payments)</li>
                  <li><strong>AI Providers:</strong> OpenAI and Google for AI processing</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
                <p>We never sell your personal information to third parties.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">6. Data Security</h2>
                <p>
                  We implement industry-standard security measures including encryption, secure servers, 
                  and regular security audits. However, no method of transmission over the Internet is 
                  100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and download your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">8. Cookies</h2>
                <p>
                  We use essential cookies for authentication and session management. We may also use 
                  analytics cookies to understand how users interact with our platform. You can control 
                  cookie settings through your browser.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">9. Children&apos;s Privacy</h2>
                <p>
                  AI Story Studio is not intended for children under 13. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from 
                  a child, please contact us immediately.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">10. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant 
                  changes via email or through our platform. Your continued use of AI Story Studio after 
                  changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">11. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or your data, contact us at:
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
