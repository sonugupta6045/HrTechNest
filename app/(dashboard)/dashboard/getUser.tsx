import { currentUser } from "@clerk/nextjs/server";
import { prisma as db } from "@/lib/prisma";

export async function getUser() {
  const authUser = await currentUser();
  if (!authUser) return null;

  let user = await db.user.findUnique({ where: { clerkId: authUser.id } });

  if (!user) {
    user = await db.user.create({
      data: {
        id: authUser.id,
        clerkId: authUser.id,
        email: authUser.emailAddresses[0].emailAddress,
        name: authUser.firstName || "User", // Default name if not provided
        title: null,
        department: null,
        bio: null,
        phone: null,
      },
    });
  }

  return user;
}
