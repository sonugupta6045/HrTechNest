import { PrismaClient, Application, Candidate, Interview, Position } from '@prisma/client';
import { evaluateApplications } from '../utils/skill-matcher';
import { sendEmail } from '../utils/email-service';
import { createCalendarEvent } from '../utils/google-calendar';
import prisma from "@/lib/prisma";

const prismaClient = new PrismaClient();

export type ShortlistedCandidate = {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: string;
  matchScore?: number;
  interviewDate?: string;
  applicationId: string;
  positionId?: string;
  meetingUrl?: string;
}

// Get all applications with status "PENDING" or "SHORTLISTED" or "INTERVIEW_SCHEDULED"
export async function getShortlistedCandidates(): Promise<ShortlistedCandidate[]> {
  const applications = await prismaClient.application.findMany({
    where: {
      status: {
        in: ["SHORTLISTED", "INTERVIEW_SCHEDULED", "PENDING", "REJECTED"]
      }
    },
    include: {
      position: true,
      interviews: {
        where: {
          status: "Scheduled"
        },
        orderBy: {
          scheduledFor: 'asc'
        },
        take: 1
      }
    }
  });

  return applications.map(app => ({
    id: app.candidateId,
    applicationId: app.id,
    name: app.name,
    position: app.position?.title || "Unknown Position",
    positionId: app.positionId || undefined,
    email: app.email,
    phone: app.phone || "",
    status: app.status === "INTERVIEW_SCHEDULED" ? "Interview Scheduled" : 
           app.status === "SHORTLISTED" ? "Shortlisted" : 
           app.status === "REJECTED" ? "Rejected" : "Pending Review",
    matchScore: app.matchScore || 0,
    interviewDate: app.interviews.length > 0 ? app.interviews[0].scheduledFor.toISOString() : undefined,
    meetingUrl: app.interviews.length > 0 ? app.interviews[0].meetingUrl || undefined : undefined
  }));
}

// Get candidates by position ID and evaluate their match score
export async function getCandidatesByPosition(positionId: string): Promise<ShortlistedCandidate[]> {
  const position = await prismaClient.position.findUnique({
    where: { id: positionId }
  });

  if (!position) {
    throw new Error("Position not found");
  }

  const applications = await prismaClient.application.findMany({
    where: {
      positionId: positionId
    },
    include: {
      interviews: {
        where: {
          status: "Scheduled"
        },
        orderBy: {
          scheduledFor: 'asc'
        },
        take: 1
      }
    }
  });

  // Evaluate applications based on the position requirements
  const evaluatedCandidates = await evaluateApplications(applications, position);

  return evaluatedCandidates.map(result => ({
    id: result.candidateId,
    applicationId: result.applicationId,
    name: result.candidateName,
    position: position.title,
    positionId: positionId,
    email: result.email,
    phone: result.phone || "",
    status: result.status === "INTERVIEW_SCHEDULED" ? "Interview Scheduled" : 
           result.status === "SHORTLISTED" ? "Shortlisted" : "Pending Review",
    matchScore: result.matchScore,
    interviewDate: applications.find(app => app.id === result.applicationId)?.interviews[0]?.scheduledFor.toISOString()
  }));
}

// Schedules interviews for the given application IDs
export async function scheduleInterviews(
  applicationIds: string[],
  scheduledFor: Date,
  userId: string,
  duration: number = 60,
  meetingUrl?: string,
  sendNotification: boolean = true,
  useGoogleCalendar: boolean = true
): Promise<Interview[]> {
  console.log(`Scheduling interviews for ${applicationIds.length} applications`);
  
  try {
    // Verify that all application IDs are valid
    const applications = await prismaClient.application.findMany({
      where: {
        id: {
          in: applicationIds
        }
      },
      include: {
        candidate: true,
        position: true
      }
    });

    console.log(`Found ${applications.length} valid applications`);
    
    if (applications.length === 0) {
      throw new Error("No valid applications found with the provided IDs");
    }
    
    // Check if any applications are already scheduled or rejected
    const invalidApplications = applications.filter(app => 
      app.status === "INTERVIEW_SCHEDULED" || app.status === "REJECTED"
    );
    
    if (invalidApplications.length > 0) {
      throw new Error(`${invalidApplications.length} applications cannot be scheduled because they are already scheduled or rejected`);
    }
    
    // Generate meeting URL with Google Calendar if not provided
    let calendarEventId = undefined;
    
    if (!meetingUrl) {
      console.log("No meeting URL provided, generating with Google Calendar");
      
      // Only try to use Google Calendar if useGoogleCalendar is true
      if (useGoogleCalendar) {
        try {
          // Get all candidate emails for the event
          const attendeeEmails = applications.map(app => app.candidate.email);
          
          // Add unique position titles to make the event title
          const positionTitles = Array.from(new Set(applications.map(app => app.position?.title)));
          const eventTitle = `Interview for ${positionTitles.join(", ")}`;
          
          // Create description
          const description = `Interview for ${applications.length} candidate(s) for the position(s): ${positionTitles.join(", ")}`;
          
          // Create calendar event
          const calendarResult = await createCalendarEvent(
            eventTitle,
            description,
            scheduledFor.toISOString(),
            duration,
            attendeeEmails
          );
          
          meetingUrl = calendarResult.meetingUrl;
          calendarEventId = calendarResult.eventId;
          
          console.log("Generated meeting URL:", meetingUrl);
        } catch (error) {
          console.error("Error creating Google Calendar event:", error);
          
          // Generate a fallback URL format for Google Meet
          const randomId = Math.random().toString(36).substring(2, 11);
          meetingUrl = `https://meet.google.com/mock-${randomId}`;
          console.log("Using fallback meeting URL:", meetingUrl);
        }
      } else {
        // If Google Calendar is disabled, generate a mock URL
        const randomId = Math.random().toString(36).substring(2, 11);
        meetingUrl = `https://meet.google.com/mock-${randomId}`;
        console.log("Google Calendar disabled. Using generated meeting URL:", meetingUrl);
      }
    }
    
    // Create interviews for each application
    const createdInterviews: Interview[] = [];
    const notificationQueue: {
      email: string;
      subject: string;
      html: string;
    }[] = [];

    // Execute the transaction
    await prismaClient.$transaction(async (tx) => {
      for (const app of applications) {
        const interview = await tx.interview.create({
          data: {
            scheduledFor,
            duration,
            meetingUrl: meetingUrl || undefined,
            status: "Scheduled",
            googleCalendarEventId: calendarEventId,
            notes: "",
            application: {
              connect: { id: app.id },
            },
            candidate: {
              connect: { id: app.candidateId },
            },
            scheduler: {
              connect: { id: userId },
            },
          }
        });

        await tx.application.update({
          where: { id: app.id },
          data: { 
            status: "INTERVIEW_SCHEDULED",
            updatedAt: new Date()
          }
        });

        createdInterviews.push(interview);

        // Queue email instead of sending it now
        if (sendNotification) {
          notificationQueue.push({
            email: app.candidate.email,
            subject: `Interview Scheduled for ${app.position?.title}`,
            html: `
              <h1>Interview Scheduled</h1>
              <p>Dear ${app.candidate?.name || 'Candidate'},</p>
              <p>Your interview for the <strong>${app.position?.title}</strong> position has been scheduled for:</p>
              <p><strong>Date and Time:</strong> ${scheduledFor.toLocaleString()}</p>
              <p><strong>Duration:</strong> ${duration} minutes</p>
              <p><strong>Meeting Link:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>
              <p>Please ensure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
              <p>Best regards,<br/>HR Team</p>
            `
          });
        }
      }
    });

    // Send queued emails after transaction is done
    for (const emailData of notificationQueue) {
      try {
        await sendEmail({
          to: emailData.email,
          subject: emailData.subject,
          html: emailData.html,
        });
        console.log(`Notification email sent to ${emailData.email}`);
      } catch (emailError) {
        console.error(`Failed to send notification email to ${emailData.email}:`, emailError);
      }
    }

    console.log(`Successfully scheduled ${createdInterviews.length} interviews`);
    return createdInterviews;
  } catch (error) {
    console.error("Error in scheduleInterviews:", error);
    throw error;
  }
}

// Shortlist a candidate
export async function shortlistCandidate(applicationId: string): Promise<Application> {
  return prismaClient.application.update({
    where: { id: applicationId },
    data: { status: "SHORTLISTED" }
  });
}

// Rejects a candidate by updating their application status
export async function rejectCandidate(applicationId: string) {
  try {
    const updatedApplication = await prismaClient.application.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        updatedAt: new Date(),
      },
      include: {
        candidate: true,
        position: true,
      },
    });

    return updatedApplication;
  } catch (error) {
    console.error("Error rejecting candidate:", error);
    throw new Error(`Failed to reject candidate: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Get all open positions
export async function getOpenPositions(): Promise<Position[]> {
  return prismaClient.position.findMany({
    where: {
      status: "OPEN"
    }
  });
}

// Get resume URL for a candidate
export async function getCandidateResume(candidateId: string): Promise<string | null> {
  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
    select: { resumeUrl: true }
  });
  
  return candidate?.resumeUrl || null;
}

// Get interview details
export async function getInterviewDetails(interviewId: string): Promise<Interview & { application: Application, candidate: Candidate }> {
  const interview = await prismaClient.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: true,
      candidate: true
    }
  });
  
  if (!interview) {
    throw new Error("Interview not found");
  }
  
  return interview;
}

// Add notes to an interview
export async function addInterviewNotes(interviewId: string, notes: string): Promise<Interview> {
  return prismaClient.interview.update({
    where: { id: interviewId },
    data: { notes }
  });
}

// Update interview status
export async function updateInterviewStatus(
  interviewId: string, 
  status: string
): Promise<Interview> {
  return prismaClient.interview.update({
    where: { id: interviewId },
    data: { status }
  });
}