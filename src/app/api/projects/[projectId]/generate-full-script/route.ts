import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, trackTokenUsage } from "@/lib/openai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate a full script." },
        { status: 401 }
      );
    }

    // Fetch project details, including characters and scenes
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        characters: true, // Assuming a direct relation
        scenes: {
          orderBy: {
            order: "asc", // Ensure scenes are in the correct order
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied." },
        { status: 404 }
      );
    }

    if (!project.scenes || project.scenes.length === 0) {
      return NextResponse.json(
        { error: "No scenes found in the project to generate a script from." },
        { status: 400 }
      );
    }

    // Construct the prompt for OpenAI
    let promptContent = `You are a professional screenwriter. Based on the following project details, write a complete, well-formatted screenplay.

Project Title: ${project.title}
Project Logline: ${project.logline || "Not provided."}
Project Treatment/Summary: ${project.treatment || "Not provided."}
`;

    if (project.characters && project.characters.length > 0) {
      promptContent += "\nCharacters:\n";
      project.characters.forEach(char => {
        promptContent += `- ${char.name}: ${char.description || "No description."}\n`;
        if (char.backstory) promptContent += `  Backstory: ${char.backstory}\n`;
        if (char.motivation) promptContent += `  Motivation: ${char.motivation}\n`;
      });
    }

    promptContent += "\n\nScene Breakdown:\n";
    project.scenes.forEach(scene => {
      promptContent += `\n--- SCENE ${scene.order} ---\n`;
      promptContent += `Title: ${scene.title || "Untitled Scene"}\n`;
      promptContent += `Summary: ${scene.summary || "No summary."}\n`;
      if (scene.location) promptContent += `Location: ${scene.location}\n`;
      if (scene.timeOfDay) promptContent += `Time of Day: ${scene.timeOfDay}\n`;
      if (scene.script) {
        promptContent += `Existing Script Snippet (use this as a strong reference for this scene's content and dialogue):
${scene.script}
`;
      } else {
        promptContent += `(No specific script snippet provided for this scene, generate based on summary and context.)
`;
      }
      promptContent += `Goals for this scene: ${scene.goals || "Not specified."}\n`;
      promptContent += `Conflicts in this scene: ${scene.conflicts || "Not specified."}\n`;
    });

    promptContent += `\n--- END OF SCENE BREAKDOWN ---\n`;
    promptContent += `\nInstructions for the Screenwriter AI:
1.  Combine all the provided scene information into a cohesive and flowing full script.
2.  Expand on the scene summaries and existing snippets to create complete scenes with dialogue, action lines, and scene headings (INT./EXT. LOCATION - DAY/NIGHT).
3.  Ensure smooth transitions between scenes.
4.  Maintain consistent character voices and motivations based on their descriptions.
5.  If a scene has an existing script snippet, integrate it naturally and expand upon it. Do not just copy it; build the full scene around it.
6.  The final output should be a complete screenplay.
`;

    const effectiveLanguage = project.language || "English";
    if (effectiveLanguage !== "English") {
      promptContent += `\nGenerate the full script in ${effectiveLanguage}. Ensure all screenplay formatting (scene headings, character names, dialogue, parentheticals, action lines) is appropriate for ${effectiveLanguage} scripts.`;
    } else {
      promptContent += `\nGenerate the full script in English, using standard screenplay format.`;
    }
    
    const model = "gpt-4o"; // Or your preferred model for long-form generation
    let generatedFullScript = "";
    let tokensUsed = 0;
    let cost = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const aiCompletion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: promptContent }],
        // Consider increasing max_tokens if scripts are very long
        // max_tokens: 4000, 
      });

      if (aiCompletion.choices[0].message.content) {
        generatedFullScript = aiCompletion.choices[0].message.content;
        promptTokens = aiCompletion.usage?.prompt_tokens || 0;
        completionTokens = aiCompletion.usage?.completion_tokens || 0;
        tokensUsed = aiCompletion.usage?.total_tokens || 0;

        const usageTrackingResult = await trackTokenUsage({
          userId: session.user.id,
          projectId,
          type: "script", // Using "script" type, could be "full_script" if you add it
          model,
          promptTokens,
          completionTokens,
          totalTokens: tokensUsed,
          operationName: `Full Script Generation: ${project.title}`,
        });
        cost = usageTrackingResult.cost || 0;

      } else {
        throw new Error("AI response for full script generation was empty or invalid.");
      }

    } catch (aiError: any) {
      console.error("[AI_FULL_SCRIPT_GENERATION_ERROR]", aiError);
      return NextResponse.json(
        { error: `Failed to generate full script using AI: ${aiError.message}` },
        { status: 500 }
      );
    }
    
    // Update the project with the generated full script
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        fullScript: generatedFullScript,
      },
    });

    return NextResponse.json({
      fullScript: updatedProject.fullScript,
      tokensUsed,
      cost,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[PROJECT_GENERATE_FULL_SCRIPT_POST_ERROR]", error);
    const errorMessage = error.message || "Failed to generate full script for the project.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
