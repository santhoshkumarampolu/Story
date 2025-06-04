import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update scenes" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, summary, script } = body;

    if (typeof title !== 'string' || typeof summary !== 'string') {
      return NextResponse.json(
        { error: "Title and summary are required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Update the scene
    const updatedScene = await prisma.scene.update({
      where: {
        id: params.sceneId,
        projectId: params.projectId,
      },
      data: {
        title,
        summary,
        script: script || null,
      },
    });

    return NextResponse.json(updatedScene);
  } catch (error) {
    console.error("[SCENE_UPDATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to update scene" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("[SCENE_DELETE] No session or user ID found", { session });
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to delete scenes" }), 
        { status: 401 }
      );
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: "Project not found" }), 
        { status: 404 }
      );
    }

    // Delete the scene
    await prisma.scene.delete({
      where: {
        id: params.sceneId,
        projectId: params.projectId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SCENE_DELETE] Error deleting scene:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to delete scene" 
      }), 
      { status: 500 }
    );
  }
} 