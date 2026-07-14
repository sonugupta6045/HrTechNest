import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { verifyRole } from "@/lib/auth-utils"

// Only GET method for HR to fetch applications
export async function GET(request: Request) {
  try {
    // Secure the endpoint - only HR and ADMIN can view all applications
    const { isAuthorized } = await verifyRole(['HR', 'ADMIN']);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
      ...(status && status !== "all" ? { status } : {})
    };

    // Build orderBy clause
    const orderBy: Prisma.ApplicationOrderByWithRelationInput = sortBy === "matchScore" 
      ? { matchScore: "desc" } 
      : { createdAt: "desc" };

    const applications = await prisma.application.findMany({
      where,
      include: {
        position: {
          select: {
            id: true,
            title: true,
            department: true
          }
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            skills: true,
            experience: true
          }
        }
      },
      orderBy,
      take: 50
    });

    // Ensure relations are handled safely
    const transformedApplications = applications.map(app => ({
      ...app,
      position: app.position || {
        id: "N/A",
        title: "No Position",
        department: "N/A"
      },
      candidate: app.candidate || {
        id: "N/A",
        name: "Unknown Candidate",
        email: "N/A",
        phone: "N/A",
        skills: [],
        experience: "N/A"
      }
    }));

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error("[APPLICATIONS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch applications", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 

async function getPositionTitle(positionId: string): Promise<string | null> {
  try {
    const position = await db.position.findUnique({
      where: { id: positionId },
      select: { title: true }
    });
    return position?.title || null;
  } catch (error) {
    console.error("Error fetching position title:", error);
    return null;
  }
}