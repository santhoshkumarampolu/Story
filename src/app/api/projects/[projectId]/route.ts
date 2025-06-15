import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Define the response type based on your schema
interface ProjectResponse {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  type: string;
  logline: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  cards: { id: string; type: string; content: string; order: number; createdAt: string; updatedAt: string }[];
  stories: { id: string; title: string; content: string; createdAt: string; updatedAt: string }[];
  scenes: { id: string; title: string; summary: string; script: string | null; storyboard: string | null; order: number; createdAt: string; updatedAt: string }[];
  characters: { id: string; name: string; description: string; createdAt: string; updatedAt: string }[];
}

interface ProjectWithRelations {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  cards: Array<{
    id: string;
    type: string;
    content: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  stories: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> } // Changed type here
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve dynamic route params if params is a Promise
    const { projectId } = await params; 

    const project = await prisma.project.findUnique({
      where: {
        id: projectId, // Ensure destructured projectId is used
        userId: session.user.id,
      },
      include: {
        scenes: {
          orderBy: {
            order: 'asc',
          },
        },
        characters: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('[GET_PROJECT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("[PROJECT_PATCH] No session or user ID found", { session });
      return NextResponse.json(
        { error: "You must be logged in to update projects" },
        { status: 401 }
      );
    }

    // Resolve dynamic route params
    const { projectId } = await params;
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { language } = body;

    // Validate language field
    if (language !== undefined && typeof language !== "string") {
      return NextResponse.json(
        { error: "Language must be a string" },
        { status: 400 }
      );
    }

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or you don't have access" },
        { status: 404 }
      );
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        language,
      },
    });

    return NextResponse.json({
      id: updatedProject.id,
      language: updatedProject.language,
      updatedAt: updatedProject.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[PROJECT_PATCH] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("[PROJECT_DELETE] No session or user ID found", { session });
      return NextResponse.json(
        { error: "You must be logged in to delete projects" },
        { status: 401 }
      );
    }

    // Resolve dynamic route params
    const { projectId } = await params;
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or you don't have access" },
        { status: 404 }
      );
    }

    // Delete the project (Prisma will handle cascading deletes based on schema)
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    console.log("[PROJECT_DELETE] Project deleted successfully", { projectId });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("[PROJECT_DELETE] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}