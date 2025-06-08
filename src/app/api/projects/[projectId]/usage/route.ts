import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface TokenUsageRecord {
  id: string;
  type: string;
  tokens: number;
  cost: number;
  createdAt: Date;
  projectId: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view usage" },
        { status: 401 }
      );
    }

    // Get project ID from params
    const { projectId } = await params;
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

    // Get usage records
    const usage = await prisma.$queryRaw<TokenUsageRecord[]>`
      SELECT * FROM "TokenUsage"
      WHERE "projectId" = ${projectId}
      ORDER BY "createdAt" DESC
    `;

    // Calculate totals
    const totalTokens = usage.reduce((sum, record) => sum + record.tokens, 0);
    const totalCost = usage.reduce((sum, record) => sum + record.cost, 0);

    return NextResponse.json({
      usage: usage.map(record => ({
        ...record,
        createdAt: record.createdAt.toISOString(),
      })),
      totalTokens,
      totalCost,
    });
  } catch (error) {
    console.error("[USAGE_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update token usage." },
        { status: 401 }
      );
    }

    const { projectId } = params;
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { tokens, type } = body;

    if (typeof tokens !== "number" || tokens <= 0) {
      return NextResponse.json(
        { error: "Invalid token count. 'tokens' must be a positive number." },
        { status: 400 }
      );
    }

    const usageType = typeof type === "string" && type.trim() !== "" ? type : "translation";

    // Verify the project exists and belongs to the user
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you do not have access." },
        { status: 404 }
      );
    }

    // Create new token usage record
    const tokenUsage = await prisma.tokenUsage.create({
      data: {
        projectId: projectId,
        userId: session.user.id, 
        tokens: tokens,
        type: usageType,
        cost: 0, // Explicitly set cost, even if it defaults in schema
      },
    });

    return NextResponse.json(tokenUsage, { status: 201 });
  } catch (error) {
    console.error("[TOKEN_USAGE_POST] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to update token usage." },
      { status: 500 }
    );
  }
}