import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH handler to update a character
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; characterId: string }> }
) {
  try {
    const { projectId, characterId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update characters" },
        { status: 401 }
      );
    }

    if (!projectId || !characterId) {
      return NextResponse.json(
        { error: "Project ID and Character ID are required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      backstory,
      motivation,
      // Any other character fields that can be updated
    } = body;

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Verify character exists and belongs to the project
    const existingCharacter = await prisma.character.findUnique({
      where: {
        id: characterId,
        projectId: projectId,
      },
    });

    if (!existingCharacter) {
      return NextResponse.json(
        { error: "Character not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare data for update, only including fields that are present in the body
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (backstory !== undefined) updateData.backstory = backstory;
    if (motivation !== undefined) updateData.motivation = motivation;

    if (Object.keys(updateData).length === 0) {
      // If no fields to update were provided, return the existing character
      return NextResponse.json(existingCharacter, { status: 200 });
    }

    const updatedCharacter = await prisma.character.update({
      where: {
        id: characterId,
      },
      data: updateData,
    });

    console.log("Updated character:", updatedCharacter);

    return NextResponse.json(updatedCharacter, { status: 200 });
  } catch (error) {
    console.error("[CHARACTERS_PATCH] Error:", error);
    let errorMessage = "Failed to update character";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET handler to fetch a single character by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; characterId: string }> }
) {
  const { projectId, characterId } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId || !characterId) {
      return NextResponse.json(
        { error: "Project ID and Character ID are required" },
        { status: 400 }
      );
    }

    const character = await prisma.character.findUnique({
      where: {
        id: characterId,
        projectId: projectId,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json(character, { status: 200 });
  } catch (error) {
    console.error("[CHARACTER_GET] Error:", error);
    let errorMessage = "Failed to fetch character";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE handler to delete a single character by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; characterId: string }> }
) {
  try {
    const { projectId, characterId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId || !characterId) {
      return NextResponse.json(
        { error: "Project ID and Character ID are required" },
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
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Verify character exists before attempting to delete
    const existingCharacter = await prisma.character.findUnique({
      where: {
        id: characterId,
        projectId: projectId,
      },
    });

    if (!existingCharacter) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    await prisma.character.delete({
      where: {
        id: characterId,
      },
    });

    return NextResponse.json(
      { message: "Character deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CHARACTER_DELETE] Error:", error);
    let errorMessage = "Failed to delete character";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}