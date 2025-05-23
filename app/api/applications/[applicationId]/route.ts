import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const applicationId = params.applicationId;
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // Check if the user has permission to update this application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        position: true
      }
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    // Check if the user owns the application or the position
    if (application.userId !== userId && application.position?.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[APPLICATION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 