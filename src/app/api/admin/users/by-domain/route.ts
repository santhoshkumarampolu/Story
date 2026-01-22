import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Delete users by email domain
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, subscriptionStatus: true }
    });

    if (!user?.isAdmin && user?.subscriptionStatus !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Prevent deleting common trusted domains accidentally
    const protectedDomains = ['gmail.com', 'google.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
    if (protectedDomains.includes(domain.toLowerCase())) {
      return NextResponse.json({ 
        error: `Cannot delete users from protected domain: ${domain}. Remove it from the protected list in the API if you really want to.` 
      }, { status: 400 });
    }

    // Don't delete the admin's own domain
    const adminDomain = session.user.email.split('@')[1];
    if (domain.toLowerCase() === adminDomain?.toLowerCase()) {
      return NextResponse.json({ 
        error: "Cannot delete users from your own domain" 
      }, { status: 400 });
    }

    // Find users with this domain
    const usersToDelete = await prisma.user.findMany({
      where: {
        email: { endsWith: `@${domain}` }
      },
      select: { id: true, email: true }
    });

    if (usersToDelete.length === 0) {
      return NextResponse.json({ 
        error: `No users found with domain: ${domain}` 
      }, { status: 404 });
    }

    // Delete users (cascade will handle related records)
    const deleteResult = await prisma.user.deleteMany({
      where: {
        email: { endsWith: `@${domain}` }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deleteResult.count} users from domain: ${domain}`,
      deletedCount: deleteResult.count,
      deletedEmails: usersToDelete.map(u => u.email)
    });

  } catch (error) {
    console.error("Delete users by domain error:", error);
    return NextResponse.json(
      { error: "Failed to delete users" },
      { status: 500 }
    );
  }
}

// Get users by domain (for preview before delete)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, subscriptionStatus: true }
    });

    if (!user?.isAdmin && user?.subscriptionStatus !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Find users with this domain
    const users = await prisma.user.findMany({
      where: {
        email: { endsWith: `@${domain}` }
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        createdAt: true,
        emailVerified: true,
        _count: {
          select: { projects: true }
        }
      }
    });

    return NextResponse.json({ 
      domain,
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        verified: !!u.emailVerified,
        projectCount: u._count.projects
      }))
    });

  } catch (error) {
    console.error("Get users by domain error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
