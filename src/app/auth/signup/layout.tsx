import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - AI Story Studio",
  description: "Create a new account",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 