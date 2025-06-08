import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Sarvam.ai translation service
const SARVAM_API_URL = "https://api.sarvam.ai/translate";
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
console.log("SARVAM_API_KEY:", SARVAM_API_KEY ? "Configured" : "Not configured");
// Ensure the API key is set in environment variables
interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

interface SarvamTranslateRequest {
  input: string;
  source_language_code: string;
  target_language_code: string;
  speaker_gender: string;
  mode: string;
  model: string;
  enable_preprocessing: boolean;
}

interface SarvamTranslateResponse {
  translated_text: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For development/testing, provide mock translations if API key is placeholder
    const isTestMode = !SARVAM_API_KEY || SARVAM_API_KEY === 'test_key_placeholder' || SARVAM_API_KEY === 'test_key_here';
    
    if (!SARVAM_API_KEY) {
      return NextResponse.json(
        { error: "Translation service not configured" },
        { status: 500 }
      );
    }

    const { text, targetLanguage }: TranslateRequest = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Text and target language are required" },
        { status: 400 }
      );
    }

    // Map language codes for Sarvam.ai
    const languageMap: Record<string, string> = {
      "Telugu": "te-IN",
      "Hindi": "hi-IN",
      "Tamil": "ta-IN",
      "Kannada": "kn-IN",
      "Malayalam": "ml-IN",
      "Gujarati": "gu-IN",
      "Marathi": "mr-IN",
      "Bengali": "bn-IN",
      "Punjabi": "pa-IN",
      "Urdu": "ur-IN"
    };

    const targetLangCode = languageMap[targetLanguage];
    if (!targetLangCode) {
      return NextResponse.json(
        { error: `Translation not supported for ${targetLanguage}` },
        { status: 400 }
      );
    }

    // Mock translations for development/testing
    if (isTestMode) {
      const mockTranslations: Record<string, Record<string, string>> = {
        "Telugu": {
          "Characters": "పాత్రలు",
          "Scenes": "దృశ్యాలు", 
          "Script": "స్క్రిప్ట్",
          "Idea": "ఆలోచన",
          "Logline": "లాగ్‌లైన్",
          "Treatment": "చికిత్స",
          "Generate": "జనరేట్ చేయండి",
          "Save": "సేవ్ చేయండి",
          "Export": "ఎక్స్‌పోర్ట్ చేయండి"
        },
        "Hindi": {
          "Characters": "पात्र",
          "Scenes": "दृश्य",
          "Script": "स्क्रिप्ट",
          "Idea": "विचार",
          "Logline": "लॉगलाइन",
          "Treatment": "उपचार",
          "Generate": "उत्पन्न करें",
          "Save": "सहेजें",
          "Export": "निर्यात करें"
        }
      };

      const mockTranslation = mockTranslations[targetLanguage]?.[text] || `[${targetLanguage}] ${text}`;
      
      return NextResponse.json({
        translatedText: mockTranslation,
        originalText: text,
        targetLanguage,
        isMockTranslation: true
      });
    }

    const contextHint = "Film writing context: ";
    const textToTranslateWithContext = `${contextHint}${text}`;

    const sarvamRequest: SarvamTranslateRequest = {
      input: textToTranslateWithContext, // Use text with prepended context
      source_language_code: "en-IN",
      target_language_code: targetLangCode,
      speaker_gender: "Female", // Changed to uppercase "Female"
      mode: "formal",
      model: "mayura:v1",
      enable_preprocessing: true
    };

    const response = await fetch(SARVAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: JSON.stringify(sarvamRequest),
    });

    if (!response.ok) {
      console.error("Sarvam.ai API error:", await response.text());
      return NextResponse.json(
        { error: "Translation service error" },
        { status: 500 }
      );
    }

    const result: SarvamTranslateResponse = await response.json();

    let finalTranslatedText = result.translated_text;
    // Remove the prepended context hint if it's still there
    if (finalTranslatedText.startsWith(contextHint)) {
      finalTranslatedText = finalTranslatedText.substring(contextHint.length);
    }

    return NextResponse.json({
      translatedText: finalTranslatedText,
      originalText: text,
      targetLanguage,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
