"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface LanguageSelectorProps {
  value: string | null;
  onChange: (language: string) => void | Promise<void>;
  disabled?: boolean;
  variant?: "dropdown" | "button";
  size?: "sm" | "md" | "lg";
}

const supportedLanguages = [
  { code: "English", label: "English", nativeLabel: "English" },
  { code: "Telugu", label: "Telugu", nativeLabel: "తెలుగు" },
  // { code: "Hindi", label: "Hindi", nativeLabel: "हिंदी" },
  // { code: "Tamil", label: "Tamil", nativeLabel: "தமிழ்" },
  // { code: "Kannada", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  // { code: "Malayalam", label: "Malayalam", nativeLabel: "മലയാളം" },
  // { code: "Gujarati", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  // { code: "Marathi", label: "Marathi", nativeLabel: "मराठी" },
  // { code: "Bengali", label: "Bengali", nativeLabel: "বাংলা" },
  // { code: "Punjabi", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
  // { code: "Urdu", label: "Urdu", nativeLabel: "اردو" }
];

export function LanguageSelector({
  value,
  onChange,
  disabled = false,
  variant = "dropdown",
  size = "md"
}: LanguageSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLanguageChange = async (newLanguage: string) => {
    if (isUpdating || disabled) return;

    setIsUpdating(true);
    try {
      await onChange(newLanguage);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentLanguage = supportedLanguages.find(lang => lang.code === value);

  if (variant === "button") {
    return (
      <Select value={value || "English"} onValueChange={handleLanguageChange} disabled={disabled || isUpdating}>
        <SelectTrigger 
          className={`
            bg-purple-500/20 border-purple-400/30 text-purple-300 hover:bg-purple-500/30
            ${size === "sm" ? "h-8 text-xs" : size === "lg" ? "h-12 text-base" : "h-10 text-sm"}
            ${isUpdating ? "opacity-50" : ""}
          `}
        >
          <div className="flex items-center space-x-2">
            {isUpdating ? (
              <Icons.spinner className="h-3 w-3 animate-spin" />
            ) : (
              <Icons.globe className="h-3 w-3" />
            )}
            <SelectValue>
              {currentLanguage ? (
                <span className="flex items-center space-x-2">
                  <span>{currentLanguage.label}</span>
                  <span className="text-xs opacity-70">{currentLanguage.nativeLabel}</span>
                </span>
              ) : (
                "Select Language"
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-black/95 border-white/10">
          {supportedLanguages.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              className="text-white hover:bg-white/10 focus:bg-white/10"
            >
              <div className="flex items-center justify-between w-full">
                <span>{language.label}</span>
                <span className="text-xs text-gray-400 ml-3">{language.nativeLabel}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={value || "English"} onValueChange={handleLanguageChange} disabled={disabled || isUpdating}>
      <SelectTrigger 
        className={`
          w-full bg-white/10 text-white border-white/10
          ${size === "sm" ? "h-8 text-xs" : size === "lg" ? "h-12 text-base" : "h-10 text-sm"}
          ${isUpdating ? "opacity-50" : ""}
        `}
      >
        <div className="flex items-center space-x-2">
          {isUpdating ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            <Icons.globe className="h-4 w-4" />
          )}
          <SelectValue>
            {currentLanguage ? (
              <span className="flex items-center space-x-2">
                <span>{currentLanguage.label}</span>
                <span className="text-xs opacity-70">{currentLanguage.nativeLabel}</span>
              </span>
            ) : (
              "Select Language"
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-black/95 border-white/10">
        {supportedLanguages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            className="text-white hover:bg-white/10 focus:bg-white/10"
          >
            <div className="flex items-center justify-between w-full">
              <span>{language.label}</span>
              <span className="text-xs text-gray-400 ml-3">{language.nativeLabel}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
