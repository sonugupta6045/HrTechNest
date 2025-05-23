import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// GET /api/interviews/list - get all interviews
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const candidateId = searchParams.get("candidateId");
    const positionId = searchParams.get("positionId");
    const dateStr = searchParams.get("date");
    
    // Build the where clause based on filters
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (candidateId) {
      where.candidateId = candidateId;
    }
    
    if (positionId) {
      where.application = {
        positionId
      };
    }
    
    // Handle date filtering
    if (dateStr) {
      const date = new Date(dateStr);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.scheduledFor = {
        gte: date,
        lt: nextDay
      };
    }
    
    // Fetch interviews with filters
    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            position: true,
          },
        },
        candidate: true,
        scheduler: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
    
    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
} 