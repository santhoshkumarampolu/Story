import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, trackTokenUsage } from "@/lib/openai";
import type { NextRequest as NextRequestType } from "next/server";

export async function POST(req: NextRequestType, context: { params: { projectId: string } }) {
  const { projectId } = context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { generatedIdeas, idea, generateRandom } = await req.json();
    // If generatedIdeas is present, save to project (optional, for inspiration history)
    if (Array.isArray(generatedIdeas)) {
      await prisma.project.update({
        where: { id: projectId },
        data: { generatedIdeas: JSON.stringify(generatedIdeas) }, // You may need to add this field to your schema
      });
    }

    // Get project and verify ownership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Generate ideas using OpenAI
    const prompt = generateRandom
      ? "Generate 3 unique short film ideas. Each idea should include a concept, conflict, emotional hook, visual style, and unique element. Format as JSON array."
      : `Generate 3 unique short film ideas based on this concept: "${idea}". Each idea should include a concept, conflict, emotional hook, visual style, and unique element. Format as JSON array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative writing assistant specializing in short film concepts.",
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
        inputTokens: completion.usage.prompt_tokens,
        outputTokens: completion.usage.completion_tokens,
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
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only select fields that exist in the schema
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
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

export async function PATCH(req: NextRequest, context: { params: { projectId: string } }) {
  const { projectId } = context.params;
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