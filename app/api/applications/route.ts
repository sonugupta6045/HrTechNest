import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function POST(request: Request) {
  try {
    // // const { userId } =  await auth()
    // if (!userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    // console.log("Received application data:", body)

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
      // Education fields
      tenthSchool,
      tenthYear,
      tenthPercentage,
      twelfthSchool,
      twelfthYear,
      twelfthPercentage,
    } = body

    // Validate required fields
    if (!jobId || !resumeUrl || !name || !email) {
      console.error("Missing required fields:", { jobId, resumeUrl, name, email })
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Ensure skills is an array
    const skillsArray = Array.isArray(skills) ? skills : [skills]

    // First, create or update the candidate
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
        // Add education fields to update
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
        // Add education fields to create
        tenthSchool,
        tenthYear,
        tenthPercentage,
        twelfthSchool,
        twelfthYear,
        twelfthPercentage,
      },
    })

    // console.log("Created/Updated candidate:", candidate)

    // Then create the application
    console.log("Creating application with data:", {
      jobId,
      candidateId: candidate.id,
      resumeUrl,
      coverLetter: coverLetter || "",
      name,
      email,
      phone: phone || "",
      skills: skillsArray,
      experience: experience || "",
      matchScore: matchScore ?? 0,
      // Add education fields to log
      tenthSchool: tenthSchool || "",
      tenthYear: tenthYear || "",
      tenthPercentage: tenthPercentage || "",
      twelfthSchool: twelfthSchool || "",
      twelfthYear: twelfthYear || "",
      twelfthPercentage: twelfthPercentage || "",
      userId: '',
      status: "PENDING",
    });
    
    const application = await db.application.create({
      data: {
        positionId: jobId, // Link the application to the position
        positionTitle: await getPositionTitle(jobId), // Store position title directly
        candidateId: candidate.id,
        resumeUrl,
        coverLetter: coverLetter || "",
        name,
        email,
        phone: phone || "",
        skills: skillsArray,
        experience: experience || "",
        matchScore: matchScore ?? 0,
        // Add education fields
        tenthSchool: tenthSchool || "",
        tenthYear: tenthYear || "",
        tenthPercentage: tenthPercentage || "",
        twelfthSchool: twelfthSchool || "",
        twelfthYear: twelfthYear || "",
        twelfthPercentage: twelfthPercentage || "",
        userId: null, // Assuming userId is not needed for now
        analysis: {},
        status: "PENDING",
      },
    });
    console.log("Created application:", application)
    return NextResponse.json(application)
  } catch (error) {
    // console.log("Error creating application:", error)
    return NextResponse.json(
      { error: "Failed to create application", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
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

    // Transform the data to ensure consistent structure even with null relations
    const transformedApplications = applications.map(app => ({
      ...app,
      position: app.position || {
        id: "N/A",
        title: "No Position",
        department: "N/A"
      },
      candidate: app.candidate || {
        id: "N/A",
        name: app.name,
        email: app.email,
        phone: app.phone,
        skills: app.skills,
        experience: app.experience
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