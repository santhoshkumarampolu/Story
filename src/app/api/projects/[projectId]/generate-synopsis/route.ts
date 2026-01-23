import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateContent } from "@/lib/gemini";
import { checkUserSubscriptionAndUsage } from "@/lib/subscription";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate synopsis" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body = await req.json();
    const { idea, logline, treatment, language } = body;

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you don't have access" },
        { status: 404 }
      );
    }

    // Check subscription and usage limits
    const { allowed } = await checkUserSubscriptionAndUsage(session.user.id, 500, 0);
    if (!allowed) {
      return NextResponse.json(
        { error: "You have reached your monthly token limit. Please upgrade to Pro for more tokens." },
        { status: 403 }
      );
    }

    // Prepare the prompt based on available content
    let prompt = "";
    let context = "";

    if (idea) context += `Idea: ${idea}\n\n`;
    if (logline) context += `Logline: ${logline}\n\n`;
    if (treatment) context += `Treatment: ${treatment}\n\n`;

    // Language-specific instructions
    const languageInstructions = {
      English: "Write in clear, professional English suitable for industry professionals.",
      Telugu: "Write in Telugu with proper grammar and cultural context. Include English translations for key terms if needed.",
      Hindi: "Write in Hindi with proper grammar and cultural context. Include English translations for key terms if needed."
    };

    prompt = `You are a professional synopsis writer specializing in creating compelling narrative summaries for film and literature projects.

${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.English}

Based on the following story elements, create a compelling synopsis that:

1. Captures the complete story arc in a concise, engaging manner
2. Highlights the key dramatic moments and emotional journey
3. Emphasizes the unique elements that make this story compelling
4. Uses vivid, cinematic language that brings the story to life
5. Maintains professional industry standards for synopsis format

Story Elements:
${context}

Please create a synopsis that is approximately 300-500 words and follows this structure:
- Opening hook that immediately engages the reader
- Clear introduction of the main character(s) and their world
- The central conflict and what's at stake
- Key plot developments and turning points
- The climax and resolution
- A compelling conclusion that leaves the reader wanting more

Focus on making the synopsis as compelling and marketable as possible while staying true to the story's core elements.`;

    const systemPrompt = "You are a professional synopsis writer with expertise in film and literature. Create compelling, marketable synopses that capture the essence of stories while highlighting their commercial potential.";

    // Generate synopsis using Gemini
    const result = await generateContent({
      model: 'flash',
      systemPrompt,
      userPrompt: prompt,
      maxTokens: 800,
      temperature: 0.7,
    });

    const generatedSynopsis = result.text.trim();

    if (!generatedSynopsis) {
      throw new Error("Failed to generate synopsis");
    }

    // Log token usage
    const tokensUsed = result.usage.totalTokens;
    const cost = (tokensUsed / 1000) * 0.000075; // Gemini Flash pricing

    await prisma.tokenUsage.create({
      data: {
        userId: session.user.id,
        projectId: projectId,
        type: "synopsis",
        tokens: tokensUsed,
        cost: cost,
        operationName: "Generate Synopsis"
      }
    });

    return NextResponse.json({
      synopsis: generatedSynopsis,
      tokensUsed,
      cost
    });

  } catch (error) {
    console.error("[GENERATE_SYNOPSIS] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate synopsis" },
      { status: 500 }
    );
  }
} 