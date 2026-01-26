import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateContent, trackTokenUsage } from '@/lib/gemini';

interface DialogueRequest {
  sceneId?: string;
  context: string;
  tone: 'emotional' | 'comedy' | 'love' | 'witty' | 'dramatic' | 'action' | 'suspense';
  length: 'short' | 'medium' | 'long';
  characters: Array<{
    name: string;
    description?: string;
  }>;
  additionalInstructions?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, language: true, type: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const body: DialogueRequest = await request.json();
    const { sceneId, context, tone, length, characters, additionalInstructions } = body;

    if (!context || !tone || !length || !characters || characters.length === 0) {
      return NextResponse.json({
        error: 'Missing required fields: context, tone, length, and at least one character'
      }, { status: 400 });
    }

    // Get scene data if sceneId is provided
    let sceneData: { [key: string]: unknown; location?: string; timeOfDay?: string; act?: string } | undefined = undefined;
    if (sceneId) {
      const scene = await prisma.scene.findUnique({
        where: { id: sceneId, projectId },
        select: { title: true, summary: true, location: true, timeOfDay: true },
      });
      if (scene) {
        sceneData = {
          ...scene,
          location: scene.location ?? undefined,
          timeOfDay: scene.timeOfDay ?? undefined,
        };
      }
    }

    // Get project characters if no specific characters provided
    let projectCharacters: Array<{ name: string; description?: string }> = [];
    if (characters.length === 0) {
      projectCharacters = await prisma.character.findMany({
        where: { projectId },
        select: { name: true, description: true },
      });
    }

    // Prepare the AI prompt
    const prompt = buildDialoguePrompt({
      context,
      tone,
      length,
      characters: characters.length > 0 ? characters : projectCharacters,
      sceneData,
      additionalInstructions,
      projectType: project.type || undefined,
    });

    // Generate dialogue using AI
    const generatedDialogue = await generateContent({
      userPrompt: prompt,
      temperature: 0.8,
      maxTokens: length === 'long' ? 1000 : length === 'medium' ? 600 : 300,
    });

    // Track token usage
    await trackTokenUsage({
      userId: session.user.id,
      projectId,
      type: 'character_generation', // or 'dialogue_generation' if that's a valid type in your schema
      model: generatedDialogue.model || 'gemini-3.0-flash',
      promptTokens: generatedDialogue.usage?.promptTokens || 0,
      completionTokens: generatedDialogue.usage?.completionTokens || 0,
      totalTokens: generatedDialogue.usage?.totalTokens || 0,
      operationName: 'Dialogue Generation',
    });

    return NextResponse.json({
      success: true,
      dialogue: generatedDialogue,
      metadata: {
        tone,
        length,
        characters: characters.map(c => c.name),
        sceneId,
      },
    });

  } catch (error) {
    console.error('Error generating dialogue:', error);
    return NextResponse.json({
      error: 'Failed to generate dialogue'
    }, { status: 500 });
  }
}

function buildDialoguePrompt({
  context,
  tone,
  length,
  characters,
  sceneData,
  additionalInstructions,
  projectType,
}: {
  context: string;
  tone: string;
  length: string;
  characters: Array<{ name: string; description?: string }>;
  sceneData?: {
    location?: string;
    timeOfDay?: string;
    act?: string;
    [key: string]: unknown;
  };
  additionalInstructions?: string;
  projectType?: string;
}): string {
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

  let prompt = `Write a ${projectType === 'screenplay' ? 'screenplay-style' : 'narrative'} dialogue for the following scene:

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

REQUIREMENTS:
- Format as proper screenplay dialogue with character names in CAPS
- Include parentheticals only when necessary for action/delivery
- Make dialogue natural and character-appropriate
- Ensure the conversation advances the scene's purpose
- Maintain consistent character voices throughout

Generate the dialogue:`;

  return prompt;
}