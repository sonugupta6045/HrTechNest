import { NextRequest, NextResponse } from "next/server";
import { shortlistCandidate } from "@/lib/services/candidate-service";
import { auth } from "@clerk/nextjs/server";

// POST /api/candidates/shortlist - shortlist a candidate
export async function POST(req: NextRequest) {
  try {
    const {userId} = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }
    
    const application = await shortlistCandidate(applicationId);
    
    return NextResponse.json({ 
      success: true, 
      application 
    });
  } catch (error) {
    console.error("Error shortlisting candidate:", error);
    return NextResponse.json(
      { error: "Failed to shortlist candidate" },
      { status: 500 }
    );
  }
} 