import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { trackTokenUsage } from '@/lib/openai';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CharacterOutput {
  name: string;
  description: string;
}

async function getProjectDetails(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        idea: true,
        logline: true,
        treatment: true,
        language: true,
        userId: true,
      },
    });
    return project;
  } catch (error) {
    console.error('Error fetching project details for character generation:', error);
    throw new Error('Failed to fetch project details.');
  }
}

export async function POST(
  request: Request, // Keep request for potential future use with getServerSession if API changes
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const projectId = params.projectId;
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (!projectDetails.idea && !projectDetails.logline && !projectDetails.treatment) {
      return NextResponse.json(
        { error: 'Project idea, logline, or treatment is required to generate characters.' },
        { status: 400 }
      );
    }

    if (projectDetails.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied. User does not own this project.' },
        { status: 403 }
      );
    }

    const { idea, logline, treatment, language } = projectDetails;

    const prompt = `Based on the following story details, generate a list of 3-5 key characters.
For each character, provide a name and a brief description (1-2 sentences).
The characters should be suitable for a story in the ${language || 'English'} language.

Story Idea: "${idea || 'Not provided'}"
Logline: "${logline || 'Not provided'}"
Treatment Summary: "${treatment || 'Not provided'}"

Please provide the output as a valid JSON array, where each object in the array has 'name' and 'description' keys. For example:
[
  { "name": "Character Name 1", "description": "Description of character 1." },
  { "name": "Character Name 2", "description": "Description of character 2." }
]
Characters:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or 'gpt-4' if preferred and available
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500, // Adjust as needed
      temperature: 0.7,
      // response_format: { type: "json_object" }, // Uncomment if using a model version that supports this reliably
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '';
    let characters: CharacterOutput[] = [];

    try {
      // Attempt to parse the response as JSON
      // The AI might sometimes return text before or after the JSON block.
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/); // Try to find the JSON array part
      if (jsonMatch && jsonMatch[0]) {
        characters = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback or error if JSON is not found or malformed
        console.warn('AI response for characters was not a clean JSON array. Raw response:', rawResponse);
        // You might try to extract characters using string manipulation as a last resort, or return an error.
        // For now, we'll return an empty array or an error if parsing fails.
        throw new Error('Failed to parse characters from AI response.');
      }
    } catch (parseError) {
      console.error('Error parsing AI character generation response:', parseError, 'Raw response:', rawResponse);
      return NextResponse.json({ error: 'Failed to parse characters from AI response. The AI may have returned an unexpected format.' }, { status: 500 });
    }
    
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    await trackTokenUsage({
      userId: projectDetails.userId,
      projectId,
      type: 'character_generation', // New type for tracking
      model: 'gpt-3.5-turbo', // Or the model used
      inputTokens,
      outputTokens,
    });

    return NextResponse.json({ characters });

  } catch (error) {
    console.error('Error generating characters:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred during character generation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json(
    { error: 'GET method not allowed for this endpoint. Use POST to generate characters.' },
    { status: 405 }
  );
}
