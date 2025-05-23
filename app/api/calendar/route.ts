import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // Build the where clause for the query
    const whereClause: any = {};
    
    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.scheduledFor = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    // Fetch interviews with related data
    const interviews = await prisma.interview.findMany({
      where: whereClause,
      include: {
        application: {
          include: {
            position: true,
          },
        },
        candidate: true,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
    
    // Format the data for calendar display
    const formattedInterviews = interviews.map(interview => ({
      id: interview.id,
      title: `Interview: ${interview.candidate.name}`,
      positionTitle: interview.application.position?.title || "Position",
      candidateName: interview.candidate.name,
      candidateEmail: interview.candidate.email,
      start: interview.scheduledFor,
      end: new Date(new Date(interview.scheduledFor).getTime() + interview.duration * 60000),
      duration: interview.duration,
      meetingUrl: interview.meetingUrl,
      status: interview.status,
      notes: interview.notes,
      applicationId: interview.applicationId,
    }));
    
    return NextResponse.json(formattedInterviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}