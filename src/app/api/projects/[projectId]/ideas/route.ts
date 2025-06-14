import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, trackTokenUsage } from "@/lib/openai";
import type { NextRequest as NextRequestType } from "next/server";

export async function POST(req: NextRequestType, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { generatedIdeas, idea, generateRandom } = await req.json();
    // Note: generatedIdeas saving removed as field doesn't exist in schema
    // If you want to save idea generation history, consider adding a separate model

    // Get project and verify ownership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      select: {
        id: true,
        userId: true,
        language: true,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const targetLanguage = project.language || "English";
    let languageSpecificPromptSegment = "";

    if (targetLanguage === "Telugu") {
      languageSpecificPromptSegment = `Please ensure the ideas are generated entirely in Telugu, using appropriate Telugu cultural nuances, names, and settings. For example, use Telugu names (like వేణు, లక్ష్మి, సూర్య, ప్రియ), locations in Andhra Pradesh or Telangana (like Hyderabad, Vijayawada, Warangal, Godavari districts, Rayalaseema villages), and cultural contexts relevant to Telugu-speaking audiences (festivals like Ugadi, Sankranti, local traditions, family values, or contemporary social themes in Telugu society).`;
    } else {
      languageSpecificPromptSegment = `Use Indian names (like Arjun, Priya, Kiran, Meera, Rajesh, Ananya, etc.), Indian locations (Mumbai streets, Delhi metro, Chennai beaches, Bangalore tech parks, Goa coastline, Kerala backwaters, Rajasthan palaces, Punjab fields, etc.), and Indian cultural contexts. Consider Indian festivals, family traditions, regional diversity, languages, food culture, or contemporary issues relevant to Indian society.`;
    }

    // Generate ideas using OpenAI
    const prompt = generateRandom
      ? `Generate 3 unique short film ideas. Each idea should include a concept, conflict, emotional hook, visual style, and unique element. ${languageSpecificPromptSegment} Format as JSON array.`
      : `Generate 3 unique short film ideas based on this concept: "${idea}". Each idea should include a concept, conflict, emotional hook, visual style, and unique element. ${languageSpecificPromptSegment} Format as JSON array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative writing assistant specializing in short film concepts for Indian cinema. You understand Indian culture, traditions, regional diversity, contemporary social issues, and storytelling that resonates with Indian audiences. You're familiar with Indian names, locations, festivals, family dynamics, and cultural nuances across different regions of India.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Track token usage
    if (completion.usage) {
      await trackTokenUsage({
        userId: session.user.id,
        projectId,
        type: "idea",
        model: "gpt-4",
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      });
    }

    let aiGeneratedIdeas: any[] = [];
    try {
      const parsed = JSON.parse(completion.choices[0].message.content || "[]");
      console.log(parsed);
      aiGeneratedIdeas = Array.isArray(parsed) ? parsed : parsed.ideas || [];
    } catch {
      aiGeneratedIdeas = [];
    }

    // Save the generated ideas to the project if needed (remove idea and generatedIdeas fields if not in schema)
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {}, // No idea or generatedIdeas
    });

    return NextResponse.json({
      generatedIdeas: aiGeneratedIdeas,
    });
  } catch (error) {
    console.error("[IDEAS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only select fields that exist in the schema
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    return NextResponse.json({
      // No idea or generatedIdeas fields
      project,
    });
  } catch (error) {
    console.error("[IDEAS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { content } = await req.json();
    if (typeof content !== "string") {
      return new NextResponse("Content is required", { status: 400 });
    }
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });
    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { idea: content },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[IDEA_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}