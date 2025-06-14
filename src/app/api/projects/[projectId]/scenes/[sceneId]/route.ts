import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  try {
    const { projectId, sceneId } = params; // Destructure projectId and sceneId

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update scenes" },
        { status: 401 }
      );
    }

    if (!projectId || !sceneId) {
      return NextResponse.json(
        { error: "Project ID and Scene ID are required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      summary,
      script,
      storyboard,
      order,
      act,
      location,
      timeOfDay,
      goals,
      conflicts,
      notes,
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

    // Verify scene exists and belongs to the project
    const existingScene = await prisma.scene.findUnique({
      where: {
        id: sceneId,
        projectId: projectId,
      },
    });

    if (!existingScene) {
      return NextResponse.json(
        { error: "Scene not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare data for update, only including fields that are present in the body
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (script !== undefined) updateData.script = script;
    if (storyboard !== undefined) updateData.storyboard = storyboard;
    if (order !== undefined) updateData.order = order;
    if (act !== undefined) updateData.act = act;
    if (location !== undefined) updateData.location = location;
    if (timeOfDay !== undefined) updateData.timeOfDay = timeOfDay;
    if (goals !== undefined) updateData.goals = goals;
    if (conflicts !== undefined) updateData.conflicts = conflicts;
    if (notes !== undefined) updateData.notes = notes;

    // Increment version if there are other changes
    if (Object.keys(updateData).length > 0) {
      updateData.version = { increment: 1 };
    } else {
      // If no fields to update were provided in the body,
      // we can either return a 200 OK with the existing scene,
      // or a 304 Not Modified, or a 400 Bad Request.
      // For now, let's return 200 with the existing scene,
      // as no actual update operation is performed.
      // Alternatively, if version must always increment on PATCH,
      // then ensure updateData.version = { increment: 1 } is always set.
      // Let's stick to incrementing version only if other data changes.
      return NextResponse.json(existingScene, { status: 200 });
    }


    const updatedScene = await prisma.scene.update({
      where: {
        id: sceneId,
      },
      data: updateData,
    });

    console.log('Updated scene:', updatedScene);

    return NextResponse.json(updatedScene, { status: 200 });
  } catch (error) {
    console.error("[SCENES_PATCH] Error:", error);
    let errorMessage = "Failed to update scene";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Optional: Add GET handler to fetch a single scene by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  try {
    const { projectId, sceneId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId || !sceneId) {
      return NextResponse.json(
        { error: "Project ID and Scene ID are required" },
        { status: 400 }
      );
    }

    const scene = await prisma.scene.findUnique({
      where: {
        id: sceneId,
        projectId: projectId,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!scene) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    return NextResponse.json(scene, { status: 200 });
  } catch (error) {
    console.error("[SCENE_GET] Error:", error);
    let errorMessage = "Failed to fetch scene";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE handler to delete a single scene by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  try {
    const { projectId, sceneId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId || !sceneId) {
      return NextResponse.json(
        { error: "Project ID and Scene ID are required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user to ensure they can delete scenes from it
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

    // Verify scene exists before attempting to delete
    const existingScene = await prisma.scene.findUnique({
        where: {
            id: sceneId,
            projectId: projectId,
        }
    });

    if (!existingScene) {
        return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    await prisma.scene.delete({
      where: {
        id: sceneId,
        // No need to re-check projectId here as we've confirmed the scene exists
        // and is part of the user's project via the project check and existingScene check.
      },
    });

    return NextResponse.json({ message: "Scene deleted successfully" }, { status: 200 }); // Or 204 No Content
  } catch (error) {
    console.error("[SCENE_DELETE] Error:", error);
    let errorMessage = "Failed to delete scene";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}