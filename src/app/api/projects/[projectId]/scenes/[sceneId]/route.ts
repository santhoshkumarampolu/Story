import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    // Get IDs from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3];
    const sceneId = pathParts[5];

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update scenes" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, summary } = body;

    if (typeof title !== 'string' || typeof summary !== 'string') {
      return NextResponse.json(
        { error: "Title and summary are required" },
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
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Update the scene
    const updatedScene = await prisma.scene.update({
      where: {
        id: sceneId,
        projectId: projectId,
      },
      data: {
        title,
        summary,
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

export async function DELETE(request: NextRequest) {
  try {
    // Get IDs from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3];
    const sceneId = pathParts[5];

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to delete scenes" },
        { status: 401 }
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
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Delete the scene
    await prisma.scene.delete({
      where: {
        id: sceneId,
        projectId: projectId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SCENE_DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete scene" },
      { status: 500 }
    );
  }
} 