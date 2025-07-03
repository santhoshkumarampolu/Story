import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import MobileWarning from "@/components/MobileWarning";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Story Studio",
  description: "Create amazing stories with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased dark`}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <SessionProvider>
          {children}
          <MobileWarning />
        </SessionProvider>
      </body>
    </html>
  );
}
