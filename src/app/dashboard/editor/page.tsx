"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("English");
  const [saving, setSaving] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");
  const [cardType, setCardType] = useState("scene");
  const [cardContent, setCardContent] = useState("");
  const [cardOrder, setCardOrder] = useState(0);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const pid = url.searchParams.get("projectId");
    if (pid) setProjectId(pid);
    // Optionally, fetch cards for this project
    // fetchCards(pid);
  }, []);

  async function handleCreateProject() {
    setSaving(true);
    const res = await fetch("/api/projects/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.redirect) {
      router.replace(data.redirect);
    } else {
      alert(data.error || "Failed to create project");
    }
  }

  async function handleAddCard() {
    if (!projectId || !cardContent) return;
    const res = await fetch("/api/projects/card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, type: cardType, content: cardContent, order: cardOrder }),
    });
    const data = await res.json();
    if (res.ok) {
      setCards([...cards, data.card]);
      setCardContent("");
    } else {
      alert(data.error || "Failed to add card");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                AI Story Studio
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Untitled Story"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="h-8 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleCreateProject} disabled={saving || !title}>
                {saving ? "Saving..." : "New Project"}
              </Button>
              <Button>Publish</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Story Structure Sidebar */}
            <div className="col-span-3 space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-4">Story Structure</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Act 1: Setup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Act 2: Confrontation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Act 3: Resolution
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-4">Characters</h3>
                <Button variant="outline" className="w-full justify-start">
                  Add Character
                </Button>
              </div>
            </div>

            {/* Main Editor */}
            <div className="col-span-9">
              <div className="rounded-lg border p-6">
                <textarea
                  className="w-full h-[500px] resize-none border-none focus:ring-0 focus:outline-none text-lg"
                  placeholder="Start writing your story here..."
                />
              </div>

              {/* Add Card Section */}
              <div className="rounded-lg border p-4 mt-6">
                <h3 className="font-semibold mb-4">Add Card</h3>
                <select value={cardType} onChange={e => setCardType(e.target.value)} className="mb-2 w-full rounded border px-2 py-1">
                  <option value="scene">Scene</option>
                  <option value="act">Act</option>
                  <option value="dialogue">Dialogue</option>
                  <option value="shortfilm">Short Film</option>
                  <option value="featurefilm">Feature Film</option>
                </select>
                <textarea
                  value={cardContent}
                  onChange={e => setCardContent(e.target.value)}
                  className="w-full mb-2 rounded border px-2 py-1"
                  placeholder="Card content..."
                />
                <Button onClick={handleAddCard} disabled={!cardContent || !projectId} className="w-full">Add Card</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}