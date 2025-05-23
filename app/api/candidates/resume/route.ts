import { NextRequest, NextResponse } from "next/server";
import { getCandidateResume } from "@/lib/services/candidate-service";
import { auth } from "@clerk/nextjs/server";

// GET /api/candidates/resume?candidateId=xxx - get resume URL for a candidate
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");
    
    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }
    
    const resumeUrl = await getCandidateResume(candidateId);
    
    if (!resumeUrl) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ resumeUrl });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
} 