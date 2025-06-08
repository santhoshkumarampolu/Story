"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import Script from 'next/script';
import { Textarea, TextareaProps } from "@/components/ui/textarea";

// Define the google object structure for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleTransliterateTextareaProps extends Omit<TextareaProps, 'onChange' | 'value'> {
  id: string; // Unique ID for the textarea
  initialValue: string;
  onValueChange: (value: string) => void;
  destinationLanguage: string; // e.g., 'te' for Telugu, 'hi' for Hindi
  transliterationEnabled: boolean;
}

export function GoogleTransliterateTextarea({
  id,
  initialValue,
  onValueChange,
  destinationLanguage,
  transliterationEnabled,
  ...props
}: GoogleTransliterateTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState(initialValue);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isTransliterationControlLoaded, setIsTransliterationControlLoaded] = useState(false);
  const controlRef = useRef<any>(null); // To store the transliteration control instance

  useEffect(() => {
    console.log('[TransliterateTextarea] Initializing - Props:', { id, initialValue, destinationLanguage, transliterationEnabled });
    setInputValue(initialValue);
  }, [initialValue, id, destinationLanguage, transliterationEnabled]); // Added dependencies for logging

  const handleScriptLoad = () => {
    console.log('[TransliterateTextarea] Google JSAPI script loaded.');
    setIsScriptLoaded(true);
  };

  useEffect(() => {
    console.log('[TransliterateTextarea] Script loaded state changed:', isScriptLoaded);
    if (isScriptLoaded && window.google && window.google.load) {
      console.log('[TransliterateTextarea] Loading inputtools...');
      window.google.load("inputtools", "1", { // Changed "elements" to "inputtools"
        packages: "transliteration",
        callback: () => {
          console.log('[TransliterateTextarea] Inputtools loaded, transliteration package ready.');
          setIsTransliterationControlLoaded(true);
        },
      });
    } else if (isScriptLoaded) {
      console.warn('[TransliterateTextarea] window.google or window.google.load not available after script load.');
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    console.log('[TransliterateTextarea] Transliteration control loaded state:', isTransliterationControlLoaded, 'Textarea ref:', textareaRef.current);
    if (isTransliterationControlLoaded && textareaRef.current) {
      if (!controlRef.current) {
        console.log('[TransliterateTextarea] Creating new TransliterationControl instance.');
        // Ensure window.google.inputtools.transliteration is available
        if (window.google && window.google.inputtools && window.google.inputtools.transliteration) {
          const options = {
            sourceLanguage: window.google.inputtools.transliteration.LanguageCode.ENGLISH, // Changed from .elements to .inputtools
            destinationLanguage: [destinationLanguage],
            shortcutKey: 'ctrl+g', 
            transliterationEnabled: transliterationEnabled, // Initial state based on prop
          };
          console.log('[TransliterateTextarea] TransliterationControl options:', options);
          const control = new window.google.inputtools.transliteration.TransliterationControl(options); // Changed from .elements to .inputtools
          controlRef.current = control;
          control.makeTransliteratable([textareaRef.current]); 
          console.log('[TransliterateTextarea] Made textarea transliterable:', textareaRef.current.id);
          // Explicitly set initial state based on prop after control is created
          if (transliterationEnabled) {
            console.log('[TransliterateTextarea] Enabling transliteration explicitly after creation.');
            controlRef.current.enableTransliteration();
          } else {
            console.log('[TransliterateTextarea] Disabling transliteration explicitly after creation.');
            controlRef.current.disableTransliteration();
          }
        } else {
          console.error("[TransliterateTextarea] Google Input Tools Transliteration library not fully loaded.");
        }
      } else {
        // This block might be redundant due to the next useEffect, but good for logging.
        console.log('[TransliterateTextarea] Control already exists. Updating enabled state based on prop:', transliterationEnabled);
        if (transliterationEnabled) {
          controlRef.current.enableTransliteration();
        } else {
          controlRef.current.disableTransliteration();
        }
      }
    }
  }, [isTransliterationControlLoaded, id, destinationLanguage, transliterationEnabled]); // transliterationEnabled added

  // Further update enabled state if transliterationEnabled prop changes after initial setup
  useEffect(() => {
    console.log('[TransliterateTextarea] transliterationEnabled prop changed:', transliterationEnabled, 'Control exists:', !!controlRef.current);
    if (controlRef.current) {
      if (transliterationEnabled) {
        console.log('[TransliterateTextarea] Enabling transliteration via prop change.');
        controlRef.current.enableTransliteration();
      } else {
        console.log('[TransliterateTextarea] Disabling transliteration via prop change.');
        controlRef.current.disableTransliteration();
      }
    }
  }, [transliterationEnabled]);


  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onValueChange(newValue);
  };

  return (
    <>
      <Script
        src="https://www.google.com/jsapi"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <Textarea
        {...props}
        id={id}
        ref={textareaRef}
        value={inputValue}
        onChange={handleChange}
        placeholder={transliterationEnabled ? `Type in English for ${destinationLanguage} (Ctrl+G to toggle)` : props.placeholder}
      />
    </>
  );
}
