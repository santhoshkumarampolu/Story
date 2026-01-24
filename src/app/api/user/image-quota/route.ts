import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkImageQuota } from "@/lib/imagen";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to check image quota" },
        { status: 401 }
      );
    }

    const quota = await checkImageQuota(session.user.id);
    
    return NextResponse.json(quota);

  } catch (error: any) {
    console.error("[IMAGE_QUOTA_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to get image quota" },
      { status: 500 }
    );
  }
}
