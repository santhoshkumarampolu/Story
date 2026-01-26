"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TONE_OPTIONS = [
  { value: "emotional", label: "Emotional" },
  { value: "comedy", label: "Comedy" },
  { value: "love", label: "Love" },
  { value: "witty", label: "Witty" },
  { value: "dramatic", label: "Dramatic" },
  { value: "action", label: "Action" },
  { value: "suspense", label: "Suspense" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "te", label: "Telugu" },
];

export default function DialogueToolLanding() {
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("emotional");
  const [length, setLength] = useState("short");
  const [language, setLanguage] = useState("en");
  const [characters, setCharacters] = useState([
    { name: "", description: "" },
    { name: "", description: "" },
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCharacterChange = (idx: number, field: "name" | "description", value: string) => {
    setCharacters((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const addCharacter = () => {
    setCharacters((prev) => [...prev, { name: "", description: "" }]);
  };

  const removeCharacter = (idx: number) => {
    setCharacters((prev) => prev.length > 2 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim() || characters.filter(c => c.name.trim()).length < 2) {
      toast.error("Please provide scene context and at least two characters.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const response = await fetch("/api/dialogue-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          tone,
          length,
          language,
          characters: characters.filter(c => c.name.trim()),
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.dialogue.text);
      } else {
        toast.error(data.error || "Failed to generate dialogue.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto my-8 shadow-lg">
      <CardHeader>
        <CardTitle>🎬 AI Dialogue Generator (Multi-Language)</CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Instantly generate authentic screenplay or story dialogue in English, Hindi, or Telugu. No login required!
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium">Scene Context</label>
            <Textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Describe the scene, situation, or conflict..."
              required
              minLength={10}
              className="mt-1"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-medium">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="font-medium">Length</label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="font-medium">Characters</label>
            <div className="space-y-2">
              {characters.map((char, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={char.name}
                    onChange={e => handleCharacterChange(idx, "name", e.target.value)}
                    placeholder={`Character ${idx + 1} Name`}
                    required
                  />
                  <Input
                    value={char.description}
                    onChange={e => handleCharacterChange(idx, "description", e.target.value)}
                    placeholder="Description (optional)"
                  />
                  {characters.length > 2 && (
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeCharacter(idx)}>
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addCharacter}>
                + Add Character
              </Button>
            </div>
          </div>
          <div>
            <label className="font-medium">Additional Instructions <span className="text-xs text-muted-foreground">(optional)</span></label>
            <Textarea
              value={additionalInstructions}
              onChange={e => setAdditionalInstructions(e.target.value)}
              placeholder="e.g. Make it funny, add a twist, etc."
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Generating..." : "Generate Dialogue"}
          </Button>
        </form>
        {result && (
          <div className="mt-6">
            <label className="font-medium mb-2 block">Generated Dialogue</label>
            <Textarea value={result} readOnly rows={10} className="font-mono bg-muted" />
            <Button
              className="mt-2"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(result);
                toast.success("Dialogue copied to clipboard!");
              }}
            >
              Copy Dialogue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
