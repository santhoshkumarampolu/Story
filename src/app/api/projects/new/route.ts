import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ProjectType = 'shortfilm' | 'story' | 'screenplay';

const getInitialContent = (type: ProjectType) => {
  switch (type) {
    case 'shortfilm':
      return {
        cards: {
          create: [
            {
              type: "shortfilm",
              content: "",
              order: 0
            }
          ]
        },
        characters: {
          create: [
            {
              name: "Character 1",
              description: "Main character description"
            }
          ]
        },
        scenes: {
          create: [
            {
              title: "Scene 1",
              summary: "Opening scene",
              order: 0
            }
          ]
        }
      };
    case 'story':
      return {
        cards: {
          create: [
            {
              type: "story",
              content: "",
              order: 0
            }
          ]
        }
      };
    case 'screenplay':
      return {
        cards: {
          create: [
            {
              type: "screenplay",
              content: "",
              order: 0
            }
          ]
        }
      };
    default:
      return {
        cards: {
          create: [
            {
              type: "story",
              content: "",
              order: 0
            }
          ]
        }
      };
  }
};

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
      } as unknown as Prisma.ProjectUncheckedCreateInput,
      include: {
        cards: true,
        characters: true,
        scenes: true
      } as unknown as Prisma.ProjectInclude
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
