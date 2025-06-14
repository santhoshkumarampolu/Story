import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> } // Changed to accept params
) {
  try {
    const { projectId } = await params; // Await and destructure projectId

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create scenes" },
        { status: 401 }
      );
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      summary, // Changed from content to summary
      script,
      storyboard,
      order,
      act,
      location,
      timeOfDay,
      goals,
      conflicts,
      notes,
      // version will be handled by Prisma default or can be passed
    } = body;

    if (!title || !summary) { // Ensure title and summary are present
      return NextResponse.json(
        { error: "Title and summary are required for a scene" },
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
        { error: "Project not found or access denied" }, // More specific error
        { status: 404 }
      );
    }

    // Create the scene with all provided fields
    const newScene = await prisma.scene.create({
      data: {
        projectId,
        title,
        summary,
        script,
        storyboard,
        order: typeof order === 'number' ? order : 0, // Ensure order is a number, default to 0
        act,
        location,
        timeOfDay,
        goals,
        conflicts,
        notes,
        version: 1, // Default version for new scene
      },
    });

    console.log('Created new scene:', newScene);

    return NextResponse.json(newScene, { status: 201 }); // Return 201 for created
  } catch (error) {
    console.error("[SCENES_POST] Error:", error); // Changed log prefix
    let errorMessage = "Failed to create scene";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}