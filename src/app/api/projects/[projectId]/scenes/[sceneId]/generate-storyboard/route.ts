import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, trackImageGeneration } from "@/lib/openai";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sceneId: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate storyboards" },
        { status: 401 }
      );
    }

    // Get project ID and scene ID from params
    const { projectId, sceneId } = await params;
    if (!projectId || !sceneId) {
      return NextResponse.json(
        { error: "Project ID and Scene ID are required" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();
    const { script, title, summary } = body;

    if (!script) {
      return NextResponse.json(
        { error: "Script is required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
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

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a black and white storyboard frame in a professional cinematic style for this scene: ${title || 'Untitled Scene'}\n\nSummary: ${summary || 'No summary'}\n\nScript: ${script}\n\nStyle: Black and white, high contrast, cinematic lighting, professional storyboard style with clear composition and framing. Use a wide shot with all characters and key elements fully visible, leaving extra space around the scene. Do not crop any characters or important objects. Everything should fit comfortably within the frame. Focus on key visual elements and dramatic moments.`,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "natural",
    });

    if (!response.data?.[0]?.url) {
      throw new Error("Failed to generate image");
    }

    // Track image generation cost
    await trackImageGeneration({
      userId: session.user.id,
      projectId,
      type: "storyboard",
      model: "dall-e-3",
      size: "1792x1024",
      imageCount: 1,
    });

    const imageUrl = response.data[0].url;

    // Download the image and upload to Cloudinary
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`;

    const cloudinaryResult = await uploadImage(base64Image, {
      folder: `story-studio/${projectId}/${sceneId}`,
      resource_type: 'image',
    });

    // Update scene with the Cloudinary URL
    const updatedScene = await prisma.scene.update({
      where: {
        id: sceneId,
        projectId: projectId,
      },
      data: {
        storyboard: cloudinaryResult.secure_url,
      },
    });

    return NextResponse.json(updatedScene);
  } catch (error) {
    console.error("[GENERATE_STORYBOARD] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate storyboard" },
      { status: 500 }
    );
  }
} 