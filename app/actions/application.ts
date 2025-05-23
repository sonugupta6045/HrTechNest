import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type ApplicationWithDetails = {
  id: string;
  name: string;
  email: string;
  position: {
    title: string;
  } | null;
  status: string;
  resumeUrl: string;
  createdAt: Date;
  matchScore: number | null;
};

export async function getRecentApplications() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { userId: userId },
        {
          position: {
            userId: userId
          }
        }
      ]
    },
    include: {
      position: {
        select: {
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  });

  return applications.map(app => ({
    id: app.id,
    name: app.name,
    email: app.email,
    position: app.position,
    status: app.status,
    resumeUrl: app.resumeUrl,
    createdAt: app.createdAt,
    matchScore: app.matchScore
  }));
} 