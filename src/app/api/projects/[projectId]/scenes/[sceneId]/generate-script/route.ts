import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { openai, trackTokenUsage } from "@/lib/openai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sceneId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Resolve dynamic route params
    const { projectId, sceneId } = await params;

    // Fetch project with characters and logline
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        characters: true,
      },
    }) as any;

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch the specific scene
    const scene = await prisma.scene.findUnique({
      where: {
        id: sceneId,
        projectId: projectId,
      },
    });

    if (!scene) {
      return NextResponse.json(
        { error: "Scene not found" },
        { status: 404 }
      );
    }

    // Prepare character information
    const characterInfo = project.characters
      .map((char: any) => `${char.name}: ${char.description}`)
      .join('\n');

    // Create a detailed prompt for the LLM
    const prompt = `Write a detailed script for this scene in the context of the following project:

Project Type: ${project.type}
Project Logline: ${project.logline || "Not provided"}

Characters:
${characterInfo}

Scene Title: ${scene.title}
Scene Summary: ${scene.summary}

Please write a professional script that:
1. Maintains consistency with the project's tone and style
2. Incorporates the characters' personalities and relationships
3. Follows proper screenplay formatting
4. Includes both dialogue and action descriptions
5. Aligns with the scene summary while adding necessary details
6. Uses the characters' established traits and motivations

Format the script in proper screenplay style with:
- Scene headings (INT./EXT. LOCATION - TIME)
- Action descriptions
- Character names in CAPS
- Dialogue indentation
- Parentheticals for character actions/emotions`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional screenwriter with expertise in creating engaging and well-structured scripts. Your task is to write detailed scene scripts that maintain character consistency and follow proper screenplay formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const script = completion.choices[0].message.content;

    // Track token usage
    await trackTokenUsage({
      userId: session.user.id,
      projectId: projectId,
      type: "script",
      model: "gpt-4",
      inputTokens: completion.usage?.prompt_tokens || 0,
      outputTokens: completion.usage?.completion_tokens || 0,
    });

    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: { script },
    });

    return NextResponse.json(updatedScene);
  } catch (error) {
    console.error("[SCRIPT_GENERATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
} 