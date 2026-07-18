import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as jose from 'jose'; // using jose for edge compatibility instead of jsonwebtoken

// Route Matchers
const isSuperAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
const isSuperAdminAuthRoute = createRouteMatcher(['/admin/login', '/api/admin/auth/login']);
const isHrRoute = createRouteMatcher(['/dashboard(.*)', '/api/hr(.*)']);
const isCandidateRoute = createRouteMatcher(['/candidate(.*)', '/api/candidate(.*)']);
const isPublicRoute = createRouteMatcher(['/jobs(.*)', '/api/public(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 1. Handle Super Admin Routes (Bypasses Clerk entirely)
  if (isSuperAdminRoute(req) && !isSuperAdminAuthRoute(req)) {
    const adminToken = req.cookies.get('admin_token')?.value;
    
    if (!adminToken) {
      if (req.url.includes('/api/')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-admin-key-change-me-in-production');
      const { payload } = await jose.jwtVerify(adminToken, secret);
      if (payload.role !== 'SUPER_ADMIN') throw new Error("Invalid role");
      return NextResponse.next();
    } catch (e) {
      // Invalid token
      if (req.url.includes('/api/')) {
        const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        response.cookies.delete('admin_token');
        return response;
      }
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Allow unauthenticated access to admin login APIs
  if (isSuperAdminAuthRoute(req)) {
    return NextResponse.next();
  }

  // 2. Handle Clerk Routes (HR & Candidate)
  if (isHrRoute(req) || isCandidateRoute(req)) {
    // If it's an HR API route, allow Admin JWT to bypass Clerk
    if (isHrRoute(req) && req.url.includes('/api/hr')) {
      const adminToken = req.cookies.get('admin_token')?.value;
      if (adminToken) {
        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-admin-key-change-me-in-production');
          const { payload } = await jose.jwtVerify(adminToken, secret);
          if (payload.role === 'SUPER_ADMIN') return NextResponse.next();
        } catch (e) {
          // Token invalid, fall back to Clerk
        }
      }
    }

    await auth.protect();
    
    // Enforce HR role for dashboard
    if (isHrRoute(req)) {
      const { sessionClaims } = await auth();
      const role = (sessionClaims?.metadata as any)?.role;
      if (role !== 'HR' && role !== 'ADMIN') {
        if (req.url.includes('/api/')) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/candidate', req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
