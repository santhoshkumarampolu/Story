"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function NewShortFilmPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || !title) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          idea,
          language,
          type: "shortfilm",
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();
      router.push(`/editor/${project.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <Card className="w-full max-w-xl border-none shadow-lg bg-white/5 backdrop-blur-lg border border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Start Your Short Film</CardTitle>
          <CardDescription className="text-gray-300">
            Got an idea? Enter a word, sentence, or paragraph describing what's in your mind.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-gray-300 font-medium">Title</label>
              <Input
                id="title"
                type="text"
                placeholder="Short film title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-white/10 text-white placeholder:text-gray-400 border-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="idea" className="text-gray-300 font-medium">Your Idea</label>
              <Textarea
                id="idea"
                placeholder="Describe your idea..."
                value={idea}
                onChange={e => setIdea(e.target.value)}
                className="bg-white/10 text-white placeholder:text-gray-400 border-white/10 min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="language" className="text-gray-300 font-medium">Language</label>
              <Input
                id="language"
                type="text"
                placeholder="Language (e.g. English)"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-white/10 text-white placeholder:text-gray-400 border-white/10"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-semibold"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Short Film"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 