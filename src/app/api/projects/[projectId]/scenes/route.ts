import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("[SCENE_CREATE] No session or user ID found", { session });
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to create scenes" }), 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, summary, order } = body;

    if (!title) {
      return new NextResponse(
        JSON.stringify({ error: "Title is required" }), 
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: "Project not found" }), 
        { status: 404 }
      );
    }

    const scene = await prisma.scene.create({
      data: {
        title,
        summary: summary || "",
        order: order || 0,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(scene);
  } catch (error) {
    console.error("[SCENE_CREATE] Error creating scene:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create scene" 
      }), 
      { status: 500 }
    );
  }
} 