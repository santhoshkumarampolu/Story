import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// This endpoint allows setting admin status
// It's protected - only existing admins can promote others
// For the FIRST admin, you need to manually set it in the database
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the requesting user is already an admin
    const requestingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, subscriptionStatus: true }
    });

    // Special case: If no admins exist yet, the first user to call this becomes admin
    const adminCount = await prisma.user.count({
      where: { 
        OR: [
          { isAdmin: true },
          { subscriptionStatus: 'admin' }
        ]
      }
    });

    if (adminCount === 0) {
      // No admins exist, make the current user an admin
      const newAdmin = await prisma.user.update({
        where: { email: session.user.email },
        data: { 
          isAdmin: true,
          subscriptionStatus: 'admin'
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "You are now the first admin",
        user: {
          email: newAdmin.email,
          isAdmin: newAdmin.isAdmin
        }
      });
    }

    // If admins exist, only admins can promote others
    if (!requestingUser?.isAdmin && requestingUser?.subscriptionStatus !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
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
