import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai'; // Import OpenAI
import { trackTokenUsage } from '@/lib/openai'; // Import trackTokenUsage
import { getServerSession } from "next-auth/next" // Import getServerSession
import { authOptions } from '@/lib/auth'; // Import authOptions

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Initialize OpenAI client

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

    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails || !projectDetails.idea) {
      return NextResponse.json(
        { error: 'Project idea not found or project does not exist' },
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

    const { idea, language } = projectDetails;

    const prompt = `Create a compelling one-sentence logline for a story based on the following idea.
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Upgraded to GPT-4 for better quality
      messages: [
        { 
          role: "system", 
          content: "You are a professional screenwriter specializing in crafting compelling loglines. You understand story structure, character motivation, and how to create engaging hooks that capture the essence of a story in a single sentence."
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const logline = completion.choices[0]?.message?.content?.trim() || '';
    const promptTokens = completion.usage?.prompt_tokens || 0;
    const completionTokens = completion.usage?.completion_tokens || 0;
    const totalTokens = completion.usage?.total_tokens || (promptTokens + completionTokens);

    // Track token usage
    await trackTokenUsage({
      userId: projectDetails.userId, 
      projectId,
      type: 'logline',
      model: 'gpt-4',
      promptTokens,
      completionTokens,
      totalTokens,
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
