import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface TokenUsageRecord {
  type: string;
  tokens: number;
  cost: number;
  projectId: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to add test data" },
        { status: 401 }
      );
    }

    const { projectId } = params;
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
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
        { error: "Project not found or you don't have access" },
        { status: 404 }
      );
    }

    // Add test usage records
    const testRecords: TokenUsageRecord[] = [
      {
        type: "script_generation",
        tokens: 1500,
        cost: 0.002,
        projectId,
      },
      {
        type: "storyboard_generation",
        tokens: 2000,
        cost: 0.003,
        projectId,
      },
      {
        type: "character_generation",
        tokens: 800,
        cost: 0.001,
        projectId,
      },
    ];

    const createdRecords = await Promise.all(
      testRecords.map(record =>
        prisma.$executeRaw`
          INSERT INTO "TokenUsage" ("id", "type", "tokens", "cost", "projectId", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${record.type}, ${record.tokens}, ${record.cost}, ${record.projectId}, NOW(), NOW())
        `
      )
    );

    return NextResponse.json({
      message: "Test data added successfully",
      records: testRecords,
    });
  } catch (error) {
    console.error("[USAGE_TEST_POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to add test data" },
      { status: 500 }
    );
  }
} 