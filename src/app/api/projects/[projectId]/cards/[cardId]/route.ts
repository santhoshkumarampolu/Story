import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Define the expected params type
interface RouteParams {
  params: {
    projectId: string;
    cardId: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("[CARD_UPDATE] No session or user ID found", { session });
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to update cards" }),
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

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: "Story not found" }),
        { status: 404 }
      );
    }

    // Update the card
    const updatedCard = await prisma.card.update({
      where: {
        id: params.cardId,
        projectId: params.projectId,
      },
      data: {
        content,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("[CARD_UPDATE] Error updating card:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to update card",
      }),
      { status: 500 }
    );
  }
}