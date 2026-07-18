import { auth } from "@clerk/nextjs/server";
import { prisma as db } from "./prisma";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * Verifies if the current logged-in user has one of the allowed roles.
 * Also allows Super Admins to bypass.
 * @param allowedRoles Array of Role enums (e.g., ['ADMIN', 'HR'])
 * @returns { isAuthorized: boolean, userId: string | null }
 */
export async function verifyRole(allowedRoles: Role[]) {
  // Check Super Admin Token First
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (token) {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.role === 'SUPER_ADMIN') {
        return { isAuthorized: true, userId: 'SUPER_ADMIN' };
      }
    } catch (e) {
      // Fallback to clerk
    }
  }

  const { userId } = await auth();
  
  if (!userId) {
    return { isAuthorized: false, userId: null };
  }
  
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  });
  
  if (!user || !allowedRoles.includes(user.role)) {
    return { isAuthorized: false, userId };
  }
  
  return { isAuthorized: true, userId };
}
