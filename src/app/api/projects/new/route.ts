import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ProjectType = 'shortfilm' | 'story' | 'screenplay';

export function getInitialContent(type: string) {
  switch (type) {
    case 'shortfilm':
      return {
        version: 1,
        structureType: 'three-act',
        idea: '',
        logline: '',
        treatment: '',
        characters: {
          create: [
            {
              name: 'Character 1',
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
              type: 'shortfilm',
              content: '',
              order: 0
            }
          ]
        }
      };
    case 'story':
      return {
        version: 1,
        idea: '',
        logline: '',
        treatment: '',
        characters: {
          create: [
            {
              name: 'Character 1',
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
              type: 'story',
              content: '',
              order: 0
            }
          ]
        }
      };
    case 'screenplay':
      return {
        version: 1,
        idea: '',
        logline: '',
        treatment: '',
        characters: {
          create: [
            {
              name: 'Character 1',
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
              type: 'screenplay',
              content: '',
              order: 0
            }
          ]
        }
      };
    default:
      return {
        version: 1,
        idea: '',
        logline: '',
        treatment: '',
        characters: {
          create: [
            {
              name: 'Character 1',
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
              type: 'story',
              content: '',
              order: 0
            }
          ]
        }
      };
  }
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
    const { title, language } = body;

    if (!title || !language) {
      console.error("[PROJECT_CREATE] Missing required fields", { title, language });
      return new NextResponse(
        JSON.stringify({ error: "Title and project type are required" }), 
        { status: 400 }
      );
    }

    console.log("[PROJECT_CREATE] Creating project", { 
      userId: session.user.id,
      title,
      language 
    });

    const initialContent = getInitialContent(language as ProjectType);

    const project = await prisma.project.create({
      data: {
        title,
        language,
        type: language,
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
