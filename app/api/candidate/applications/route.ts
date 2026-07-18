import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma as db } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      jobId,
      resumeUrl,
      coverLetter,
      name,
      email,
      phone,
      skills,
      experience,
      matchScore,
      tenthSchool,
      tenthYear,
      tenthPercentage,
      twelfthSchool,
      twelfthYear,
      twelfthPercentage,
    } = body

    if (!jobId || !resumeUrl || !name || !email) {
      console.error("Missing required fields:", { jobId, resumeUrl, name, email })
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized. Please log in to apply." }, { status: 401 });
    }

    const skillsArray = Array.isArray(skills) ? skills : [skills]

    const user = await db.user.upsert({
      where: { clerkId },
      update: {
        name,
        phone,
      },
      create: {
        id: clerkId,
        clerkId,
        name,
        email,
        phone,
      }
    });

    const candidate = await db.candidate.upsert({
      where: {
        userId: user.id,
      },
      update: {
        resumeUrl,
        skills: skillsArray,
        experience,
        tenthSchool,
        tenthYear,
        tenthPercentage,
        twelfthSchool,
        twelfthYear,
        twelfthPercentage,
      },
      create: {
        userId: user.id,
        resumeUrl,
        skills: skillsArray,
        experience,
        tenthSchool,
        tenthYear,
        tenthPercentage,
        twelfthSchool,
        twelfthYear,
        twelfthPercentage,
      },
    })

    const application = await db.application.create({
      data: {
        positionId: jobId,
        candidateId: candidate.id,
        resumeUrl,
        coverLetter: coverLetter || "",
        matchScore: matchScore ?? 0,
        userId: null,
        analysis: {},
        status: "PENDING",
      },
    });
    
    return NextResponse.json(application)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create application", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
