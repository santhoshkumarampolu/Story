import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  try {
    const { projectId, sceneId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId || !sceneId) {
      return NextResponse.json(
        { error: "Project ID and Scene ID are required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { language } = body; // Expect language from the client

    // 1. Verify project and scene existence and user ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
      include: { characters: true } // Include characters for context
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const scene = await prisma.scene.findUnique({
      where: { id: sceneId, projectId: projectId },
    });

    if (!scene) {
      return NextResponse.json(
        { error: "Scene not found" },
        { status: 404 }
      );
    }

    if (!scene.summary) {
        return NextResponse.json(
            { error: "Scene summary is required to generate a script." },
            { status: 400 }
        );
    }

    // 2. AI Script Generation Logic
    let prompt = `Generate a detailed script for the following scene, in ${language || project.language || 'English'}.\n\n`;
    prompt += `Project Title: ${project.title || 'Untitled Project'}\n`;
    if (project.logline) prompt += `Project Logline: ${project.logline}\n`;
    prompt += `Scene Title: ${scene.title || 'Untitled Scene'}\n`;
    prompt += `Scene Summary: ${scene.summary}\n`;
    if (scene.location) prompt += `Location: ${scene.location}\n`;
    if (scene.timeOfDay) prompt += `Time of Day: ${scene.timeOfDay}\n`;
    if (scene.act) prompt += `Act: ${scene.act}\n`;
    if (scene.goals) prompt += `Scene Goals: ${scene.goals}\n`;
    if (scene.conflicts) prompt += `Scene Conflicts: ${scene.conflicts}\n`;
    if (scene.notes) prompt += `Additional Notes for Scene: ${scene.notes}\n`;
    
    if (project.characters.length > 0) {
        prompt += `\nCharacters potentially involved in the project (use as context if relevant for the scene):\n`;
        project.characters.forEach(char => {
            prompt += `- ${char.name}: ${char.description}`;
            if (char.backstory) prompt += ` Backstory: ${char.backstory}`;
            if (char.motivation) prompt += ` Motivation: ${char.motivation}`;
            prompt += '\n';
        });
    }
    prompt += `\nBased on all the above information, write a compelling and detailed script for this specific scene. Format it professionally (e.g., character names in uppercase before dialogue, concise action descriptions/scene settings). Ensure the dialogue is natural and serves the scene's purpose.`;

    console.log("Generating script with prompt:", prompt);

    // // Replace with your actual OpenAI call using generateResponse
    // const { text: generatedScript, tokens: tokensUsed } = await generateResponse(
    //   session.user.id,
    //   projectId,
    //   prompt,
    //   "scene_script_generation"
    // );

    // Placeholder for OpenAI API call simulation
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    const generatedScript = `
[SCENE START]

**INT. ${scene.location || 'LOCATION'} - ${scene.timeOfDay || 'TIME'}**

${scene.summary}

CHARACTER A
(Dialogue reflecting scene goals: ${scene.goals || '[goal]'})
Some dialogue here.

CHARACTER B
(Dialogue reflecting scene conflicts: ${scene.conflicts || '[conflict]'})
Some counter-dialogue here.

[SCENE END]
        `.trim();
    const tokensUsed = Math.floor(Math.random() * 500) + 100; // Placeholder for tokens

    if (!generatedScript) {
      return NextResponse.json(
        { error: "Failed to generate script from AI" },
        { status: 500 }
      );
    }

    // Token usage is handled by generateResponse, so direct recording might be redundant if using it.
    // If not using generateResponse, you would call recordTokenUsage here.
    // await recordTokenUsage(session.user.id, projectId, tokensUsed, "scene_script_generation");
    console.log(`Tokens used (placeholder): ${tokensUsed}`);

    // 4. Update the scene in the database
    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        script: generatedScript,
        version: { increment: 1 }
      },
    });

    return NextResponse.json({ 
        message: "Script generated successfully", 
        script: generatedScript, 
        sceneId: updatedScene.id,
        version: updatedScene.version,
        tokensUsed // Send tokens used back to client for display or tracking if needed
    }, { status: 200 });

  } catch (error) {
    console.error("[SCENE_GENERATE_SCRIPT_POST] Error:", error);
    let errorMessage = "Failed to generate script for scene";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}