import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const { userId } = await auth();
    console.log(userId)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidateId = params.candidateId;
    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    // Fetch the candidate with their resume URL
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        resumeUrl: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ resumeUrl: candidate.resumeUrl });
  } catch (error) {
    console.error("Error fetching candidate resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate resume" },
      { status: 500 }
    );
  }
} 