import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor - AI Story Studio",
  description: "Create and edit your stories",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 