import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to save synopsis" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body = await req.json();
    const { synopsis } = body;

    if (synopsis === undefined) {
      return NextResponse.json(
        { error: "Synopsis content is required" },
        { status: 400 }
      );
    }

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or you don't have access" },
        { status: 404 }
      );
    }

    // Update the project with synopsis
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        blurb: synopsis, // Using the blurb field for synopsis
      },
    });

    return NextResponse.json({
      synopsis: updatedProject.blurb,
      updatedAt: updatedProject.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[SAVE_SYNOPSIS] Error:", error);
    return NextResponse.json(
      { error: "Failed to save synopsis" },
      { status: 500 }
    );
  }
} 