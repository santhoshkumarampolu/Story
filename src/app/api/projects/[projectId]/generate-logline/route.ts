import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateContent, trackTokenUsage } from '@/lib/gemini';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

async function getProjectDetails(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        idea: true,
        language: true,
        userId: true, // Select userId to pass to trackTokenUsage
      },
    });
    return project;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw new Error('Failed to fetch project details.');
  }
}

export async function POST(
  request: Request, // request might still be needed for other purposes, or can be removed if not used elsewhere
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  try {
    // Pass only authOptions to getServerSession in App Router
    const session = await getServerSession(authOptions); 
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Parse request body to get idea and language
    const body = await request.json();
    const { idea: requestIdea, language: requestLanguage } = body;

    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Ensure projectDetails.userId is available and matches the session userId for security
    if (!projectDetails.userId || projectDetails.userId !== userId) {
        return NextResponse.json(
            { error: 'Project user ID not found or access denied.' },
            { status: 404 }
        );
    }

    // Use idea from request body if provided, otherwise fall back to database
    const idea = requestIdea || projectDetails.idea;
    const language = requestLanguage || projectDetails.language;

    if (!idea) {
      return NextResponse.json(
        { error: 'No idea provided. Please add an idea first.' },
        { status: 400 }
      );
    }

    const userPrompt = `Create a compelling one-sentence logline for a story based on the following idea.
The logline should be in ${language || 'English'} and follow these guidelines:

1. Structure: [Protagonist] must [goal] before [stakes]
2. Include:
   - Main character and their motivation
   - Central conflict or challenge
   - Stakes or consequences
   - Clear genre/tone indication
3. Keep it concise (25-30 words)
4. Make it engaging and hook the reader
5. Avoid spoilers or revealing the ending
6. Use active voice and present tense

Story Idea: "${idea}"

Please provide only the logline, no additional text or explanation.`;

    const systemPrompt = "You are a professional screenwriter specializing in crafting compelling loglines. You understand story structure, character motivation, and how to create engaging hooks that capture the essence of a story in a single sentence.";

    const result = await generateContent({
      model: 'flash',
      systemPrompt,
      userPrompt,
      maxTokens: 100,
      temperature: 0.7,
    });

    const logline = result.text.trim() || '';

    // Track token usage
    await trackTokenUsage({
      userId: projectDetails.userId, 
      projectId,
      type: 'logline',
      model: result.model,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    });

    return NextResponse.json({ logline });
  } catch (error) {
    console.error('Error generating logline:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return NextResponse.json(
    { error: 'GET method not allowed for this endpoint. Use POST to generate a logline.' },
    { status: 405 }
  );
}
