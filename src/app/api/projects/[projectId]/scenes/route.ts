import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get projectId from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/scenes

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create scenes" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (typeof title !== 'string' || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Title and content are required" },
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

    // Create the scene
    const newScene = await prisma.scene.create({
      data: {
        title,
        summary: content,
        order: 0,
        projectId,
      },
    });

    return NextResponse.json(newScene);
  } catch (error) {
    console.error("[SCENE_CREATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to create scene" },
      { status: 500 }
    );
  }
} 