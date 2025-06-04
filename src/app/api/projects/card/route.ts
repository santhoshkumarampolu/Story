import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId, type, content, order } = await req.json();
  if (!projectId || !type || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const card = await prisma.story.create({
    data: {
      projectId,
      content,
      title: content, // or provide a separate title if available
      project: { connect: { id: projectId } },
    },
  });
  return NextResponse.json({ card });
}
