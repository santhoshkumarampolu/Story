import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("[PROJECTS_GET] No session or user ID found", { session });
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to view projects" }), 
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET] Error fetching projects:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch projects" 
      }), 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create projects" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, language, type, idea } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    // Create project with initial data
    const project = await prisma.project.create({
      data: {
        title,
        description,
        language,
        type,
        userId: session.user.id,
        // For short films, we'll create initial scenes and characters later
        ...(type === "shortfilm" && {
          logline: idea, // Store the initial idea as logline
        }),
      },
    });

    // If it's a short film, generate initial structure
    if (type === "shortfilm" && idea) {
      // TODO: Call AI service to generate:
      // 1. Expanded logline
      // 2. Character descriptions
      // 3. Scene breakdown
      
      // For now, create placeholder scenes
      await prisma.scene.createMany({
        data: [
          {
            title: "Opening Scene",
            summary: "Establish the setting and introduce main characters",
            order: 0,
            projectId: project.id,
          },
          {
            title: "Rising Action",
            summary: "Develop the conflict and build tension",
            order: 1,
            projectId: project.id,
          },
          {
            title: "Climax",
            summary: "The main conflict reaches its peak",
            order: 2,
            projectId: project.id,
          },
          {
            title: "Resolution",
            summary: "Resolve the conflict and show the aftermath",
            order: 3,
            projectId: project.id,
          },
        ],
      });

      // Create placeholder characters
      await prisma.character.createMany({
        data: [
          {
            name: "Protagonist",
            description: "The main character of the story",
            projectId: project.id,
          },
          {
            name: "Antagonist",
            description: "The character who opposes the protagonist",
            projectId: project.id,
          },
        ],
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_CREATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
} 