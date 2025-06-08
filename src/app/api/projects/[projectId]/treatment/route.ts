import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, trackTokenUsage } from "@/lib/openai";

export async function POST(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Access params in an async context
    const { projectId } = await context.params;
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

    const targetLanguage = project.language || "English"; // Default to English if not set
    let languageSpecificPrompt = "";

    if (targetLanguage === "Telugu") {
      languageSpecificPrompt = `Please ensure the treatment is written entirely in Telugu, using appropriate Telugu cultural nuances, names, and settings.`;
    } else {
      languageSpecificPrompt = `Please ensure the treatment uses Indian names, locations, and cultural contexts, incorporating authentic Indian settings (cities like Mumbai, Delhi, Chennai, Bangalore, or regions like Kerala, Rajasthan, Punjab, etc.), reflecting Indian family dynamics, traditions, and social relationships, considering relevant contemporary Indian themes or timeless cultural values, using appropriate Indian cultural references, festivals, customs, or social situations, and featuring realistic Indian character backgrounds and motivations.`;
    }

    // Call OpenAI to generate treatment
    const prompt = `Given the following idea and logline, write a detailed treatment (story overview/outline) for a short film.
Project Language: ${targetLanguage}

Idea: ${idea}
Logline: ${logline}

${languageSpecificPrompt}

Treatment:`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a creative writing assistant specializing in short film treatments for Indian cinema. You understand Indian culture, regional diversity, family structures, social dynamics, and contemporary issues. You create authentic stories that resonate with Indian audiences while respecting cultural nuances and traditions." },
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

export async function PATCH(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Access params in an async context
    const { projectId } = await context.params;
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