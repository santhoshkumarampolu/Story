import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view debug data" },
        { status: 401 }
      );
    }

    // Get all token usage records for this user
    const allUsage = await prisma.tokenUsage.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Get summary stats
    const totalTokens = allUsage.reduce((sum, record) => sum + record.tokens, 0);
    const totalCost = allUsage.reduce((sum, record) => sum + record.cost, 0);

    return NextResponse.json({
      totalRecords: allUsage.length,
      totalTokens,
      totalCost,
      recentRecords: allUsage.slice(0, 5).map(record => ({
        id: record.id,
        type: record.type,
        tokens: record.tokens,
        cost: record.cost,
        createdAt: record.createdAt.toISOString()
      })),
      allRecords: allUsage.map(record => ({
        id: record.id,
        projectId: record.projectId,
        type: record.type,
        tokens: record.tokens,
        cost: record.cost,
        createdAt: record.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error("[DEBUG_USAGE] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}
