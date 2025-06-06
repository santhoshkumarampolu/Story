import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, trackTokenUsage } from "@/lib/openai";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Access params in an async context
    const projectId = params.projectId;
    const { idea, logline } = await req.json();
    if (!idea || !logline) {
      return NextResponse.json({ error: "Idea and logline are required" }, { status: 400 });
    }
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    // Call OpenAI to generate treatment
    const prompt = `Given the following idea and logline, write a detailed treatment (story overview/outline) for a short film.\n\nIdea: ${idea}\nLogline: ${logline}\n\nTreatment:`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a creative writing assistant specializing in short film treatments." },
        { role: "user", content: prompt },
      ],
    });
    const treatment = completion.choices[0].message.content?.trim() || "";

    // Track token usage
    if (completion.usage) {
      await trackTokenUsage({
        userId: session.user.id,
        projectId,
        type: "treatment",
        model: "gpt-4",
        inputTokens: completion.usage.prompt_tokens,
        outputTokens: completion.usage.completion_tokens,
      });
    }

    // Save treatment to project
    await prisma.project.update({
      where: { id: projectId },
      data: { treatment },
    });
    return NextResponse.json({ treatment });
  } catch (error) {
    console.error("[TREATMENT_GENERATE] Error:", error);
    return NextResponse.json({ error: "Failed to generate treatment" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Access params in an async context
    const projectId = params.projectId;
    const { content } = await req.json();
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    // Save treatment to project
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { treatment: content },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[TREATMENT_PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to save treatment" }, { status: 500 });
  }
} 