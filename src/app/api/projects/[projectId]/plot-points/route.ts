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
        { error: "You must be logged in to save plot points" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body = await req.json();
    const { plotPoints } = body;

    if (plotPoints === undefined) {
      return NextResponse.json(
        { error: "Plot points content is required" },
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

    // Update the project with plot points
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        plotPoints: plotPoints,
      },
    });

    return NextResponse.json({
      plotPoints: updatedProject.plotPoints,
      updatedAt: updatedProject.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[SAVE_PLOT_POINTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to save plot points" },
      { status: 500 }
    );
  }
} 