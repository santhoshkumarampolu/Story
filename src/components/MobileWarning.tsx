"use client";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";

export default function MobileWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] bg-black/90 backdrop-blur-lg border border-purple-500/30 rounded-xl px-6 py-4 min-w-[300px] shadow-2xl flex items-center space-x-3">
      <span className="text-purple-400">
        <Info className="h-6 w-6 animate-bounce" />
      </span>
      <span className="text-white font-medium text-base">
        For the best experience, use a laptop or PC!
      </span>
    </div>
  );
} 