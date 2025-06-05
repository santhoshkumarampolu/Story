import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get projectId from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/cards

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to create cards" }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;
    if (typeof content !== "string") {
      return new NextResponse(
        JSON.stringify({ error: "Content is required" }),
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: "Project not found" }),
        { status: 404 }
      );
    }

    const newCard = await prisma.card.create({
      data: {
        content,
        projectId,
        type: "story",
        order: 0,
      },
    });

    return NextResponse.json(newCard);
  } catch (error) {
    console.error("[CARD_CREATE] Error creating card:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to create card",
      }),
      { status: 500 }
    );
  }
} 