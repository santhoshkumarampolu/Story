import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Get projectId from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/share

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to share projects" },
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

    // Generate a unique token
    const shareToken = crypto.randomBytes(32).toString('hex');

    // Create share link
    const shareLink = await prisma.share.create({
      data: {
        token: shareToken,
        projectId,
      },
    });

    return NextResponse.json({
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
    });
  } catch (error) {
    console.error("[SHARE_CREATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get projectId from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/share

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view share links" },
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

    // Get all share links for the project
    const shareLinks = await prisma.share.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(shareLinks);
  } catch (error) {
    console.error("[SHARE_LIST] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch share links" },
      { status: 500 }
    );
  }
} 