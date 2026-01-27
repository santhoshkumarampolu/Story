import type { Metadata } from "next";
import { Inter, Space_Grotesk, Lora, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import MobileWarning from "@/components/MobileWarning";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aistorystudio.com'),
  title: {
    default: "AI Story Studio - Create Stories, Screenplays & Scripts with AI",
    template: "%s | AI Story Studio"
  },
  description: "Transform your ideas into compelling stories, screenplays, and scripts with AI assistance. Write in 6 Indian languages including Hindi, Telugu, Tamil, Kannada, and Malayalam. Free to start.",
  keywords: [
    "AI dialogue writing",
    "AI dialogue generator",
    "dialogue writing with AI",
    "AI story writer",
    "screenplay writing software",
    "script generator",
    "AI writing assistant",
    "story creator",
    "Hindi screenplay",
    "Telugu script writing",
    "Tamil story writing",
    "Indian language storytelling",
    "film script generator",
    "short film writing",
    "novel writing UI",
    "creative writing tool"
  ],
  authors: [{ name: "AI Story Studio" }],
  creator: "AI Story Studio",
  publisher: "AI Story Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://aistorystudio.com",
    siteName: "AI Story Studio",
    title: "AI Story Studio - Create Stories & Screenplays with AI",
    description: "Transform your ideas into compelling stories and screenplays with AI assistance. Write in 6 Indian languages. Free to start.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Story Studio - AI-Powered Storytelling Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Story Studio - Create Stories & Screenplays with AI",
    description: "Transform your ideas into compelling stories with AI assistance. Write in Hindi, Telugu, Tamil & more.",
    images: ["/og-image.png"],
    creator: "@aistorystudio",
  },
  verification: {
    google: [
      "uSsVy5mnT04v-Cqt1jAjGYkeDbqBySOTfHDXXtjLUsQ", // Domain 1 verification
      "D8EHaG9dGlSAJm6dY_R3Y5Ip4il4Mi0yiMb9V1gVjQA",        // Domain 2 verification - replace this
    ],
  },
  alternates: {
    // canonical set per page
  },
};

import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} ${lora.variable} font-outfit min-h-screen bg-background antialiased dark`}>
        <GoogleAnalytics />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <SessionProvider>
          {children}
          <MobileWarning />
        </SessionProvider>
      </body>
    </html>
  );
}
