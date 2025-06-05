import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get projectId from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/characters

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create characters" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (typeof name !== 'string' || typeof description !== 'string') {
      return NextResponse.json(
        { error: "Name and description are required" },
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

    // Create the character
    const newCharacter = await prisma.character.create({
      data: {
        name,
        description,
        projectId,
      },
    });

    return NextResponse.json(newCharacter);
  } catch (error) {
    console.error("[CHARACTER_CREATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
} 