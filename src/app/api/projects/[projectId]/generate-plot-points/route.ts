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
        { error: "You must be logged in to generate plot points" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body = await req.json();
    const { logline, treatment, synopsis, language } = body;

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
    let context = "";
    if (logline) context += `Logline: ${logline}\n\n`;
    if (treatment) context += `Treatment: ${treatment}\n\n`;
    if (synopsis) context += `Synopsis: ${synopsis}\n\n`;

    if (!context.trim()) {
      return NextResponse.json(
        { error: "No story content available. Please add a logline, treatment, or synopsis first." },
        { status: 400 }
      );
    }

    // Language-specific instructions
    const languageInstructions = {
      English: "Write in clear, professional English suitable for industry professionals.",
      Telugu: "Write in Telugu with proper grammar and cultural context. Include English translations for key terms if needed.",
      Hindi: "Write in Hindi with proper grammar and cultural context. Include English translations for key terms if needed."
    };

    const prompt = `You are a story structure expert specializing in identifying and articulating key plot points that drive narrative forward.

${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.English}

Based on the following story elements, create a comprehensive plot points breakdown that:

1. Identifies the major turning points in the story
2. Outlines the three-act structure (if applicable)
3. Highlights key dramatic moments and conflicts
4. Shows character development and arc progression
5. Maps the emotional journey of the protagonist
6. Identifies the climax and resolution points

Story Elements:
${context}

Please create a structured plot points breakdown that includes:

- **Opening/Setup**: How the story begins and the world is established
- **Inciting Incident**: The event that sets the story in motion
- **First Act Break**: The point where the protagonist commits to the journey
- **Rising Action**: Key complications and obstacles
- **Midpoint**: A major turning point that changes the direction
- **Second Act Break**: The lowest point or major setback
- **Climax**: The final confrontation or resolution of the main conflict
- **Resolution**: How the story concludes and loose ends are tied

Focus on making each plot point clear, dramatic, and essential to the story's progression.`;

    const systemPrompt = "You are a story structure expert with deep understanding of narrative arcs, character development, and dramatic pacing. You excel at identifying key plot points that drive stories forward and create compelling narrative momentum.";

    // Generate plot points using Gemini
    const result = await generateContent({
      model: 'flash',
      systemPrompt,
      userPrompt: prompt,
      maxTokens: 800,
      temperature: 0.7,
    });

    const generatedPlotPoints = result.text.trim();

    if (!generatedPlotPoints) {
      throw new Error("Failed to generate plot points");
    }

    // Log token usage
    const tokensUsed = result.usage.totalTokens;
    const cost = (tokensUsed / 1000) * 0.000075; // Gemini Flash pricing

    await prisma.tokenUsage.create({
      data: {
        userId: session.user.id,
        projectId: projectId,
        type: "plot-points",
        tokens: tokensUsed,
        cost: cost,
        operationName: "Generate Plot Points"
      }
    });

    return NextResponse.json({
      plotPoints: generatedPlotPoints,
      tokensUsed,
      cost
    });

  } catch (error) {
    console.error("[GENERATE_PLOT_POINTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate plot points" },
      { status: 500 }
    );
  }
} 