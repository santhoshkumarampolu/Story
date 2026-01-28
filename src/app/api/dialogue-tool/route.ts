import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateContent, trackTokenUsage } from '@/lib/gemini';

interface DialogueToolRequest {
  context: string;
  tone: 'emotional' | 'comedy' | 'love' | 'witty' | 'dramatic' | 'action' | 'suspense';
  length: 'short' | 'medium' | 'long';
  characters: Array<{ name: string; description?: string }>;
  language: 'en' | 'hi' | 'te' | 'kn' | 'ta' | 'ml' | 'es' | 'fr' | 'de'; // English, Hindi, Telugu, Kannada, Tamil, Malayalam, Spanish, French, German
  conflictIntensity?: 'low' | 'medium' | 'high';
  writingStyle?: 'casual' | 'formal' | 'poetic' | 'tarantino';
  sceneObjective?: string;
  keyBeats?: string;
  variationMode?: boolean;
  transliteration?: boolean;
  additionalInstructions?: string;
  sceneData?: {
    title?: string;
    summary?: string;
    location?: string;
    timeOfDay?: string;
    act?: string;
    [key: string]: unknown;
  };
  projectType?: string;
}

export async function POST(request: Request) {
  try {
    // For dialogue tool, allow anonymous access (no authentication required)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    let user = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenUsageThisMonth: true, subscriptionStatus: true }
      });

      // Limit check for free users: 12,000 tokens total for the tool/month
      if (user && user.subscriptionStatus === 'free' && user.tokenUsageThisMonth >= 12000) {
        return NextResponse.json({
          error: 'token_limit_reached',
          message: 'You have reached your 12,000 token limit for this month. Subscribe to Pro to continue generating unlimited dialogue!'
        }, { status: 403 });
      }
    }

    const body: DialogueToolRequest = await request.json();
    const { 
      context, tone, length, characters, language, 
      conflictIntensity, writingStyle, sceneObjective, 
      keyBeats, variationMode, transliteration,
      additionalInstructions, sceneData, projectType 
    } = body;

    if (!context || !tone || !length || !characters || characters.length === 0 || !language) {
      return NextResponse.json({
        error: 'Missing required fields: context, tone, length, language, and at least one character'
      }, { status: 400 });
    }

    const prompt = buildMultilingualDialoguePrompt({
      context,
      tone,
      length,
      characters,
      sceneData,
      additionalInstructions,
      projectType,
      language,
      conflictIntensity,
      writingStyle,
      sceneObjective,
      keyBeats,
      variationMode,
      transliteration,
    });

    const generatedDialogue = await generateContent({
      userPrompt: prompt,
      temperature: 0.8,
      maxTokens: length === 'long' ? 10000 : length === 'medium' ? 7200 : 6000,
    });

    // Track token usage for everyone (including guests)
    await trackTokenUsage({
      userId: userId || undefined,
      projectId: undefined,
      type: 'character_generation',
      model: generatedDialogue.model || 'gemini-3.0-flash',
      promptTokens: generatedDialogue.usage?.promptTokens || 0,
      completionTokens: generatedDialogue.usage?.completionTokens || 0,
      totalTokens: generatedDialogue.usage?.totalTokens || 0,
      operationName: 'Dialogue Generation Tool',
    });

    return NextResponse.json({
      success: true,
      dialogue: generatedDialogue,
      metadata: {
        tone,
        length,
        language,
        characters: characters.map(c => c.name),
      },
    });
  } catch (error) {
    console.error('Error generating dialogue (tool):', error);
    return NextResponse.json({
      error: 'Failed to generate dialogue'
    }, { status: 500 });
  }
}

function buildMultilingualDialoguePrompt({
  context,
  tone,
  length,
  characters,
  sceneData,
  additionalInstructions,
  projectType,
  language,
  conflictIntensity,
  writingStyle,
  sceneObjective,
  keyBeats,
  variationMode,
  transliteration,
}: {
  context: string;
  tone: string;
  length: string;
  characters: Array<{ name: string; description?: string }>;
  sceneData?: {
    title?: string;
    summary?: string;
    location?: string;
    timeOfDay?: string;
    act?: string;
    [key: string]: unknown;
  };
  additionalInstructions?: string;
  projectType?: string;
  language: 'en' | 'hi' | 'te' | 'kn' | 'ta' | 'ml' | 'es' | 'fr' | 'de';
  conflictIntensity?: string;
  writingStyle?: string;
  sceneObjective?: string;
  keyBeats?: string;
  variationMode?: boolean;
  transliteration?: boolean;
}): string {
  const languageNames = { 
    en: 'English', 
    hi: 'Hindi', 
    te: 'Telugu', 
    kn: 'Kannada', 
    ta: 'Tamil', 
    ml: 'Malayalam',
    es: 'Spanish',
    fr: 'French',
    de: 'German'
  };
  const lengthGuide = {
    short: 'brief exchanges (2-4 lines per character)',
    medium: 'moderate length conversations (4-8 lines per character)',
    long: 'extended dialogues with depth (8+ lines per character)',
  };
  const toneDescriptions = {
    emotional: 'deep feelings, vulnerability, heartfelt moments',
    comedy: 'humorous, witty, light-hearted banter',
    love: 'romantic, tender, affectionate exchanges',
    witty: 'clever wordplay, sarcasm, intelligent humor',
    dramatic: 'intense, serious, high-stakes conversations',
    action: 'fast-paced, urgent, high-energy exchanges',
    suspense: 'tense, mysterious, building anticipation',
  };

  const writingStyleDescriptions = {
    casual: 'natural, everyday speech, using slang and contractions',
    formal: 'proper vocabulary, no slang, structured and professional',
    poetic: 'metaphorical, rhythmic, evocative language',
    tarantino: 'cool, pop-culture heavy, philosophical yet gritty and rhythmic banter',
  };

  const conflictDescriptions = {
    low: 'polite disagreement or minor misunderstanding',
    medium: 'noticeable tension, power struggle, or conflicting desires',
    high: 'intense verbal battle, high stakes, or emotional explosion',
  };

  let prompt = `Generate a ${projectType === 'screenplay' ? 'screenplay-style' : 'narrative'} dialogue in ${languageNames[language] || 'the specified language'} for this scene.

SCENE CONTEXT: ${context}`;

  if (sceneObjective) {
    prompt += `\nSCENE OBJECTIVE: ${sceneObjective}`;
  }

  prompt += `\nTONE: ${toneDescriptions[tone as keyof typeof toneDescriptions] || tone}`;

  if (writingStyle && writingStyleDescriptions[writingStyle as keyof typeof writingStyleDescriptions]) {
    prompt += `\nWRITING STYLE: ${writingStyleDescriptions[writingStyle as keyof typeof writingStyleDescriptions]}`;
  }

  if (conflictIntensity && conflictDescriptions[conflictIntensity as keyof typeof conflictDescriptions]) {
    prompt += `\nCONFLICT LEVEL: ${conflictDescriptions[conflictIntensity as keyof typeof conflictDescriptions]}`;
  }

  prompt += `\nLENGTH: ${lengthGuide[length as keyof typeof lengthGuide]}`;

  if (keyBeats) {
    prompt += `\nKEY BEATS TO COVER: ${keyBeats}`;
  }

  prompt += `\n\nCHARACTERS:`;
  characters.forEach((char, index) => {
    prompt += `\n${index + 1}. ${char.name}${char.description ? ` - ${char.description}` : ''}`;
  });

  if (sceneData) {
    prompt += `\n\nSCENE DETAILS:
- Title: ${sceneData.title}
- Summary: ${sceneData.summary}
- Location: ${sceneData.location}
- Time: ${sceneData.timeOfDay}`;
  }

  if (additionalInstructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS: ${additionalInstructions}`;
  }

  if (variationMode) {
    prompt += `\n\nVARIATION MODE: Provide two distinct versions of this scene with slightly different emotional arcs or outcomes.`;
  }

  if (transliteration && language !== 'en') {
    prompt += `\n\nTRANSLITERATION: For all ${languageNames[language]} dialogue, provide BOTH the original script and the Romanized (English characters) transliteration immediately after the original line.`;
  }

  const isIndianLanguage = ['hi', 'te', 'kn', 'ta', 'ml'].includes(language);

  prompt += `

IMPORTANT GUIDE FOR ${languageNames[language]}:
- Use natural, colloquial, and conversational ${languageNames[language]}.
- Avoid overly bookish, heavy, or formal literary vocabulary.
- Reflect how real people speak in everyday life.`;

  if (isIndianLanguage) {
    prompt += `\n- It's natural to mix in common English words as people do in current urban settings (e.g., Hinglish, Telugish, Tanglish, Kanglish, etc.).`;
  }

  prompt += `

IMPORTANT: Generate ONLY the dialogue. Do not include any introductory text, explanations, or meta-comments. Start directly with the character names and dialogue in proper screenplay format.

Example format:
RAMU
Hello, how are you?

SOMU
I'm fine, thank you.`;

  return prompt;
}
