import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
    const isAdminPageRoute = req.nextUrl.pathname.startsWith("/admin");

    // Protect API routes strictly, except for set-admin which handles its own bootstrap logic
    if (isApiAdminRoute && !token?.isAdmin && !req.nextUrl.pathname.startsWith("/api/admin/set-admin")) {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden - Admin only" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    // For the admin PAGE, we'll allow all logged-in users to see the "Become Admin" 
    // button page if they aren't admins yet, but the page content itself 
    // will be empty/error because the API calls will fail.
    // This maintains the "First Admin" bootstrap functionality.
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/protected/:path*",
    "/api/admin/:path*",
  ],
}; 