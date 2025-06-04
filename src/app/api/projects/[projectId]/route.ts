import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("[PROJECT_GET] No session or user ID found", { session });
      return NextResponse.json(
        { error: "You must be logged in to view projects" },
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

    // Fetch project with related cards, stories, scenes, and characters
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        cards: { orderBy: { order: "asc" } },
        stories: true,
        scenes: { orderBy: { order: "asc" } },
        characters: true,
      } as any
    }) as any;

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you don't have access" },
        { status: 404 }
      );
    }

    // Serialize dates to strings for JSON response
    const response: ProjectResponse = {
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      cards: project.cards.map((card: any) => ({
        ...card,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      })),
      stories: project.stories.map((story: any) => ({
        ...story,
        createdAt: story.createdAt.toISOString(),
        updatedAt: story.updatedAt.toISOString(),
      })),
      scenes: project.scenes.map((scene: any) => ({
        ...scene,
        createdAt: scene.createdAt.toISOString(),
        updatedAt: scene.updatedAt.toISOString(),
      })),
      characters: project.characters.map((character: any) => ({
        ...character,
        createdAt: character.createdAt.toISOString(),
        updatedAt: character.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[PROJECT_GET] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}