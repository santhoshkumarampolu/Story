import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateContent, trackTokenUsage } from "@/lib/gemini";

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
    const prompt = `Write a detailed treatment (story overview) for a short film based on the following idea and logline.
Project Language: ${targetLanguage}

Idea: ${idea}
Logline: ${logline}

${languageSpecificPrompt}

Please structure the treatment with the following sections:

1. Story Overview (2-3 paragraphs)
   - Main plot points
   - Key character arcs
   - Central themes
   - Emotional journey

2. Character Dynamics
   - Main character's journey
   - Key relationships
   - Character motivations
   - Conflicts and resolutions

3. Story Structure
   - Beginning (setup and inciting incident)
   - Middle (rising action and complications)
   - End (climax and resolution)
   - Key turning points

4. Themes and Messages
   - Core themes
   - Cultural elements
   - Social commentary
   - Emotional resonance

5. Visual and Stylistic Elements
   - Key locations
   - Visual motifs
   - Tone and atmosphere
   - Cultural aesthetics

Please ensure the treatment:
- Is 2-3 pages in length
- Maintains narrative coherence
- Develops characters meaningfully
- Creates emotional impact
- Respects cultural context
- Sets up clear story progression

Treatment:`;

    const systemPrompt = "You are a professional screenwriter and story consultant specializing in Indian cinema. You excel at creating detailed treatments that balance narrative structure, character development, and cultural authenticity. You understand both traditional storytelling and contemporary filmmaking techniques.";

    const result = await generateContent({
      model: 'flash',
      systemPrompt,
      userPrompt: prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    const treatment = result.text.trim() || "";

    // Track token usage
    await trackTokenUsage({
      userId: session.user.id,
      projectId,
      type: "treatment",
      model: result.model,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
      operationName: "Treatment Generation"
    });

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