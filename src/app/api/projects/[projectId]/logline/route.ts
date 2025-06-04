import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update projects" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { logline } = body;

    if (typeof logline !== 'string') {
      return NextResponse.json(
        { error: "Logline is required" },
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

    // Update the logline
    const updatedProject = await prisma.project.update({
      where: {
        id: params.projectId,
      },
      data: {
        logline,
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