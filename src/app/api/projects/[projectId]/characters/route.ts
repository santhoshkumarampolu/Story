import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create a character" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      );
    }

    if (description && typeof description !== 'string') {
      return NextResponse.json(
        { error: "Description must be a string" },
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
        { error: "Project not found or you do not have permission to access it" },
        { status: 404 }
      );
    }

    // Create the character
    const newCharacter = await prisma.character.create({
      data: {
        name,
        description: description || "", // Ensure description is not undefined
        projectId: projectId,
      },
    });

    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    console.error("[CHARACTER_CREATE] Error:", error);
    // Check for specific Prisma errors if necessary, e.g., unique constraint violation
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   // Handle specific Prisma errors
    // }
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}