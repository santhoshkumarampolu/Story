import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("[CARD_CREATE] No session or user ID found", { session });
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to add cards" }), 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, order } = body;

    if (!type || typeof order !== 'number') {
      return new NextResponse(
        JSON.stringify({ error: "Type and order are required" }), 
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

    const card = await prisma.card.create({
      data: {
        type,
        content: "",
        order,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("[CARD_CREATE] Error creating card:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create card" 
      }), 
      { status: 500 }
    );
  }
} 