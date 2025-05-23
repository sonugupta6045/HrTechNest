import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { rejectCandidate } from "@/lib/services/candidate-service";

// POST /api/candidates/reject - reject a candidate
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }
    
    // Reject the candidate using the candidate service
    await rejectCandidate(applicationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting candidate:", error);
    return NextResponse.json(
      { error: "Failed to reject candidate" },
      { status: 500 }
    );
  }
} 