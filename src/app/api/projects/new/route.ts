import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ProjectType = 'shortfilm' | 'story' | 'screenplay';

function getInitialContent(type: string) {
  const indianNames = ['Arjun', 'Priya', 'Kiran', 'Meera'];
  const characterName = indianNames[Math.floor(Math.random() * indianNames.length)];
  
  return {
    version: 1,
    structureType: type === 'shortfilm' ? 'three-act' : undefined,
    idea: '',
    logline: '',
    treatment: '',
    characters: {
      create: [
        {
          name: characterName,
          description: 'Main character description',
          motivation: '',
          backstory: '',
          arc: '',
          relationships: ''
        }
      ]
    },
    scenes: {
      create: [
        {
          title: 'Scene 1',
          summary: 'Opening scene',
          order: 0,
          act: 'act1',
          notes: '',
          version: 1
        }
      ]
    },
    cards: {
      create: [
        {
          type: type,
          content: '',
          order: 0
        }
      ]
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("[PROJECT_CREATE] No session or user ID found", { session });
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to create a project" }), 
        { status: 401 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.error("[PROJECT_CREATE] User not found", { userId: session.user.id });
      return new NextResponse(
        JSON.stringify({ error: "User not found" }), 
        { status: 404 }
      );
    }

    const body = await req.json();
    // Rename 'language' from body to 'projectType' for clarity
    const { title, language: projectType } = body;

    if (!title || !projectType) {
      console.error("[PROJECT_CREATE] Missing required fields", { title, projectType });
      return new NextResponse(
        JSON.stringify({ error: "Title and project type are required" }), 
        { status: 400 }
      );
    }

    console.log("[PROJECT_CREATE] Creating project", { 
      userId: session.user.id,
      title,
      projectType 
    });

    const initialContent = getInitialContent(projectType as ProjectType);

    const project = await prisma.project.create({
      data: {
        title,
        language: "en", // Default UI language to English
        type: projectType, // Store the project type correctly
        userId: session.user.id,
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
    console.error("[PROJECT_CREATE] Error creating project:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create project" 
      }), 
      { status: 500 }
    );
  }
}
