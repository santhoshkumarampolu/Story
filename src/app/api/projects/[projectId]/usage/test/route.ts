import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get projectId from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/usage/test

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to test usage" },
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

    // Get usage count
    const usageCount = await prisma.tokenUsage.count({
      where: {
        projectId,
      },
    });

    return NextResponse.json({ usageCount });
  } catch (error) {
    console.error("[USAGE_TEST] Error:", error);
    return NextResponse.json(
      { error: "Failed to test usage" },
      { status: 500 }
    );
  }
} 