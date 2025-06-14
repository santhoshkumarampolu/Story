import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { trackTokenUsage } from '@/lib/openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Scene {
  title: string;
  summary: string;
  // Add other relevant fields if needed, e.g., setting, charactersInScene, etc.
}

interface SceneOutput {
  title: string;
  summary: string;
  act: string;
  order: number;
  location: string;
  timeOfDay: string;
  characters: string[];
  goals: string;
  conflicts: string;
  emotionalBeats: string[];
  notes: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> } // Changed type here
) {
  try { // Added try block here to ensure projectId is resolved before use
    const { projectId } = await params; // Added this line to await and destructure projectId
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, language: true, structureType: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const { idea, logline, treatment, characters } = body;

    if (!idea || !logline || !treatment || !characters) {
      return NextResponse.json({ error: 'Idea, logline, treatment, and characters are required' }, { status: 400 });
    }

    const characterNames = characters.map((char: { name: string; description: string; }) => char.name).join(', ');

    const prompt = `Based on the following story details, generate a structured scene breakdown that follows the story's structure type (${project.structureType || 'three-act'}).

Story Details:
Idea: ${idea}
Logline: ${logline}
Treatment: ${treatment}

Characters:
${characterNames}

Generate 5-8 scenes that:
1. Follow proper story structure
2. Include all key characters appropriately
3. Build tension and conflict
4. Advance the plot
5. Develop character arcs

For each scene, provide:
- Title
- Summary (2-3 sentences)
- Act (act1, act2, act3)
- Order (chronological position)
- Location
- Time of Day
- Characters involved
- Scene Goals
- Conflicts
- Emotional Beats
- Notes

Format as JSON array:
[
  {
    "title": "Scene Title",
    "summary": "Scene description",
    "act": "act1",
    "order": 1,
    "location": "Scene location",
    "timeOfDay": "Time of day",
    "characters": ["Character1", "Character2"],
    "goals": "Scene goals",
    "conflicts": "Scene conflicts",
    "emotionalBeats": ["beat1", "beat2"],
    "notes": "Additional notes"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.7
    });

    const generatedContent = completion.choices[0]?.message?.content;
    if (!generatedContent) {
      throw new Error('No content generated by OpenAI.');
    }

    let scenes: SceneOutput[];
    try {
      const parsedJson = JSON.parse(generatedContent);
      if (parsedJson.scenes && Array.isArray(parsedJson.scenes)) {
        scenes = parsedJson.scenes;
      } else {
        // Fallback for unexpected structures, or if the model returned an array directly (less likely with json_object mode)
        console.warn("OpenAI response was valid JSON but not in the expected {scenes: array} format. Raw content:", generatedContent);
        if (Array.isArray(parsedJson)) {
          console.warn("Attempting to use root JSON as scenes array.");
          scenes = parsedJson; // Treat the root as the array of scenes
        } else {
          throw new Error('Generated content is not in the expected format {scenes: [...]} or an array.');
        }
      }
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      console.error('Raw OpenAI response:', generatedContent);
      let specificError = 'Failed to parse scenes from OpenAI response. The response was not valid JSON or not in the expected format.';
      if (e instanceof SyntaxError) {
        specificError = 'Failed to parse scenes: OpenAI response was not valid JSON.';
      } else if (e instanceof Error) {
        specificError = `Failed to parse scenes: ${e.message}`;
      }
      throw new Error(specificError);
    }
    
    // Validate that scenes is an array and its elements have title and summary
    if (!Array.isArray(scenes) || !scenes.every(s => typeof s.title === 'string' && typeof s.summary === 'string')) {
        console.error('Parsed scenes are not in the correct format. Scenes:', scenes);
        throw new Error('Generated scenes are not in the expected format (array of objects with title and summary).');
    }


    if (completion.usage) {
      await trackTokenUsage({
        userId: session.user.id,
        projectId,
        model: completion.model,
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
        type: 'scenes', // Ensure this type is handled in trackTokenUsage
        operationName: 'Scene Generation',
        cost: ((completion.usage.prompt_tokens / 1000) * 0.0005) + ((completion.usage.completion_tokens / 1000) * 0.0015) // Example pricing for gpt-3.5-turbo-0125
      });
    }

    return NextResponse.json({ scenes });

  } catch (error) {
    console.error('[API - Generate Scenes] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.stack : null }, { status: 500 });
  }
}
