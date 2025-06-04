import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const { expiresIn } = await req.json();

    // Generate a unique share token
    const shareToken = nanoid(16);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresIn || 7)); // Default 7 days

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        token: shareToken,
        projectId,
        createdById: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
      expiresAt: shareLink.expiresAt,
    });
  } catch (error) {
    console.error("[SHARE_CREATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    // Get all active share links for the project
    const shareLinks = await prisma.shareLink.findMany({
      where: {
        projectId,
        createdById: session.user.id,
        expiresAt: {
          gt: new Date(),
        },
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