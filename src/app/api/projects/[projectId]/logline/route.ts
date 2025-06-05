import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    // Get projectId from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/logline

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update logline" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: "Content is required" },
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

    // Update the logline
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        logline: content,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[LOGLINE_UPDATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to update logline" },
      { status: 500 }
    );
  }
} 