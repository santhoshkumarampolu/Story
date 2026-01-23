import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Sarvam.ai translation service
const SARVAM_API_URL = "https://api.sarvam.ai/translate";
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

interface TranslateContentRequest {
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
  contentType?: 'idea' | 'logline' | 'treatment' | 'synopsis' | 'script' | 'general';
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

// Language code mapping for Sarvam.ai
const languageCodeMap: Record<string, string> = {
  "English": "en-IN",
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

// Split long text into chunks for translation
// Sarvam.ai mayura:v1 model has 1000 character limit
function splitIntoChunks(text: string, maxChunkSize: number = 900): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If single paragraph is too long, split by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        currentChunk = '';
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 1 > maxChunkSize) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          }
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function translateChunk(
  chunk: string, 
  sourceLangCode: string, 
  targetLangCode: string
): Promise<string> {
  // Don't add context hints as they count towards the 1000 char limit
  const sarvamRequest: SarvamTranslateRequest = {
    input: chunk,
    source_language_code: sourceLangCode,
    target_language_code: targetLangCode,
    speaker_gender: "Female",
    mode: "formal",
    model: "mayura:v1",
    enable_preprocessing: true
  };

  const response = await fetch(SARVAM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": SARVAM_API_KEY!,
    },
    body: JSON.stringify(sarvamRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Sarvam.ai API error:", errorText);
    throw new Error(`Translation API error: ${response.status}`);
  }

  const result = await response.json();
  return result.translated_text;
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

    if (!SARVAM_API_KEY) {
      return NextResponse.json(
        { error: "Translation service not configured" },
        { status: 500 }
      );
    }

    const { content, sourceLanguage, targetLanguage, contentType = 'general' }: TranslateContentRequest = await req.json();

    if (!content || !targetLanguage) {
      return NextResponse.json(
        { error: "Content and target language are required" },
        { status: 400 }
      );
    }

    // Get language codes
    const sourceLangCode = languageCodeMap[sourceLanguage] || "en-IN";
    const targetLangCode = languageCodeMap[targetLanguage];

    if (!targetLangCode) {
      return NextResponse.json(
        { error: `Translation to ${targetLanguage} is not supported` },
        { status: 400 }
      );
    }

    // Same language - return original
    if (sourceLangCode === targetLangCode) {
      return NextResponse.json({
        translatedContent: content,
        sourceLanguage,
        targetLanguage,
        unchanged: true
      });
    }

    // Split content into chunks if too long (900 chars to stay under 1000 limit)
    const chunks = splitIntoChunks(content);
    
    // Translate each chunk
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const translated = await translateChunk(chunk, sourceLangCode, targetLangCode);
      translatedChunks.push(translated);
    }

    // Join translated chunks
    const translatedContent = translatedChunks.join('\n\n');

    return NextResponse.json({
      translatedContent,
      sourceLanguage,
      targetLanguage,
      chunksTranslated: chunks.length
    });

  } catch (error) {
    console.error("Content translation error:", error);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}
