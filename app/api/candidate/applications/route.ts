import { NextResponse } from "next/server"
import { db } from "@/lib/db"

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

    const skillsArray = Array.isArray(skills) ? skills : [skills]

    const candidate = await db.candidate.upsert({
      where: {
        email: email,
      },
      update: {
        name,
        phone,
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
        name,
        email,
        phone,
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
