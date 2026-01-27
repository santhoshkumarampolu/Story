import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// This endpoint allows setting admin status
// Only the Super Admin (santhoshkumarampolu@gmail.com) can promote others
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Strictly check for the super admin email
    if (session.user.email !== 'santhoshkumarampolu@gmail.com') {
      return NextResponse.json({ error: "Forbidden - Super Admin only" }, { status: 403 });
    }

    // Get the email to promote from request body
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: { 
        isAdmin: true,
        subscriptionStatus: 'admin'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} is now an admin`,
      user: {
        email: user.email,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus
      }
    });

  } catch (error) {
    console.error("Set admin error:", error);
    return NextResponse.json(
      { error: "Failed to set admin status" },
      { status: 500 }
    );
  }
}
