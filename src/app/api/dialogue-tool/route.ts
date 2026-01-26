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
  language: 'en' | 'hi' | 'te'; // English, Hindi, Telugu
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: DialogueToolRequest = await request.json();
    const { context, tone, length, characters, language, additionalInstructions, sceneData, projectType } = body;

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
    });

    const generatedDialogue = await generateContent({
      userPrompt: prompt,
      temperature: 0.8,
      maxTokens: length === 'long' ? 10000 : length === 'medium' ? 7200 : 6000,
    });

    await trackTokenUsage({
      userId: session.user.id,
      projectId: null as unknown as string,
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
  language: 'en' | 'hi' | 'te';
}): string {
  const languageNames = { en: 'English', hi: 'Hindi', te: 'Telugu' };
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
  let prompt = `Generate a ${projectType === 'screenplay' ? 'screenplay-style' : 'narrative'} dialogue in ${languageNames[language] || 'the specified language'} for this scene:

SCENE CONTEXT: ${context}

TONE: ${toneDescriptions[tone as keyof typeof toneDescriptions] || tone}

LENGTH: ${lengthGuide[length as keyof typeof lengthGuide]}

CHARACTERS:`;
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
  prompt += `

IMPORTANT: Generate ONLY the dialogue. Do not include any introductory text, explanations, or meta-comments. Start directly with the character names and dialogue in proper screenplay format.

Example format:
RAMU
Hello, how are you?

SOMU
I'm fine, thank you.

RAMU
That's good to hear.`;
  return prompt;
}
