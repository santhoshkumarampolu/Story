import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, trackTokenUsage } from "@/lib/openai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sceneId: string }> }
) {
  try {
    const { projectId, sceneId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate storyboards" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      sceneTitle,
      sceneSummary,
      sceneScript, // Script from client, can be context for storyboard
      projectLanguage, // Language preference from client
      logline, // Project-level context from client
      treatment, // Project-level context from client
      characters, // Project characters from client for context
    } = body;

    if (!sceneSummary && !sceneScript) {
      return NextResponse.json(
        { error: "Scene summary or script is required to generate a storyboard" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user, and scene belongs to project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        scenes: { where: { id: sceneId } },
        // You might also want to fetch project.characters if not passed reliably from client
      },
    });

    if (!project || !project.scenes || project.scenes.length === 0) {
      return NextResponse.json(
        { error: "Project or Scene not found, or access denied" },
        { status: 404 }
      );
    }
    const scene = project.scenes[0]; // The specific scene we are working with

    // Construct the prompt for OpenAI text generation
    let promptContent = `Project Logline: ${logline || project.logline || 'N/A'}\n`;
    promptContent += `Project Treatment Summary: ${treatment || project.treatment || 'N/A'}\n`;
    if (characters && characters.length > 0) {
      promptContent += `Characters involved in the story:\n${characters.map((c: any) => `- ${c.name}: ${c.description || 'No description'}`).join('\n')}\n\n`;
    }
    promptContent += `Scene Title: ${sceneTitle || scene.title}\n`;
    promptContent += `Scene Summary: ${sceneSummary || scene.summary}\n`;
    if (sceneScript || scene.script) { // Use script from body if provided, else from DB
      promptContent += `Scene Script:\n${sceneScript || scene.script}\n`;
    }
    promptContent += `\nBased on the above information, generate a textual storyboard. Describe key shots, camera angles, character actions, and visual elements for this scene. The output should be a series of distinct shot descriptions, each clearly delineated.`;
    
    const effectiveLanguage = projectLanguage || project.language || "English";
    if (effectiveLanguage !== "English") {
      promptContent += `\nGenerate the storyboard in ${effectiveLanguage}.`;
    }

    const model = "gpt-4o"; // Or your preferred model for text generation
    let generatedStoryboardText = "";
    let tokensUsed = 0;
    let cost = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const aiCompletion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: promptContent }],
        // max_tokens: 1500, // Optional: Adjust as needed
      });

      if (aiCompletion.choices[0].message.content) {
        generatedStoryboardText = aiCompletion.choices[0].message.content;
        promptTokens = aiCompletion.usage?.prompt_tokens || 0;
        completionTokens = aiCompletion.usage?.completion_tokens || 0;
        tokensUsed = aiCompletion.usage?.total_tokens || 0;

        // Track token usage
        const usageTrackingResult = await trackTokenUsage({
          userId: session.user.id,
          projectId,
          type: "storyboard", // Ensure this type is valid in your enum/function
          model,
          promptTokens,
          completionTokens,
          totalTokens: tokensUsed,
          operationName: `Scene Storyboard: ${scene.title || 'Untitled Scene'}`,
        });
        cost = usageTrackingResult.cost || 0; // trackTokenUsage calculates and returns cost

      } else {
        throw new Error("AI response for storyboard generation was empty or invalid.");
      }

    } catch (aiError: any) {
      console.error("[AI_STORYBOARD_GENERATION_ERROR]", aiError);
      return NextResponse.json(
        { error: `Failed to generate storyboard using AI: ${aiError.message}` },
        { status: 500 }
      );
    }
    
    // Update scene with the generated textual storyboard
    const updatedScene = await prisma.scene.update({
      where: {
        id: sceneId,
        // projectId: projectId, // Already confirmed scene belongs to project
      },
      data: {
        storyboard: generatedStoryboardText, // Save the text storyboard
        version: { increment: 1 },
      },
    });

    return NextResponse.json({
      storyboard: updatedScene.storyboard,
      tokensUsed,
      cost,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[SCENE_GENERATE_STORYBOARD_POST_ERROR]", error);
    const errorMessage = error.message || "Failed to generate scene storyboard";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}