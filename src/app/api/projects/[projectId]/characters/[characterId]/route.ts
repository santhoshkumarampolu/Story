import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    // Get IDs from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3];
    const characterId = pathParts[5];

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update characters" },
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

    // Update the character
    const updatedCharacter = await prisma.character.update({
      where: {
        id: characterId,
        projectId: projectId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error("[CHARACTER_UPDATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get IDs from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3];
    const characterId = pathParts[5];

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to delete characters" }),
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
      return new NextResponse(
        JSON.stringify({ error: "Project not found" }),
        { status: 404 }
      );
    }

    // Delete the character
    await prisma.character.delete({
      where: {
        id: characterId,
        projectId: projectId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHARACTER_DELETE] Error deleting character:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to delete character",
      }),
      { status: 500 }
    );
  }
} 