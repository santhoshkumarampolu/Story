import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInitialContent } from "@/app/api/projects/new/route";

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

    console.log("[PROJECT_CREATE] Creating project", { 
      userId: session.user.id,
      title,
      type,
      language 
    });

    // Get the initial content structure based on project type
    const initialContent = getInitialContent(type);
    
    // Create project with all the structured data
    const project = await prisma.project.create({
      data: {
        title,
        description,
        language,
        type,
        userId: session.user.id,
        // For short films, store the initial idea as logline
        ...(type === "shortfilm" && idea && {
          logline: idea,
          idea: idea
        }),
        // Add all the predefined structure from initialContent
        ...initialContent
      },
      include: {
        cards: true,
        characters: true,
        scenes: true
      }
    });

    console.log("[PROJECT_CREATE] Project created successfully", { projectId: project.id });
    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_CREATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
} 