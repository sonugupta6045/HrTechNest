import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

import { Interview } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // With the updated schema, the userId from Clerk is directly used as the User ID in the database
    // No need to fetch the user separately
    
    const body = await req.json()
    console.log("Received scheduling request:", body);
    
    const { applicationIds, scheduledFor, duration, meetingUrl, useGoogleCalendar = true, sendNotification = true } = body
    
    if (!applicationIds || !scheduledFor || !Array.isArray(applicationIds)) {
      return NextResponse.json(
        { error: "Invalid request data - applicationIds must be an array and scheduledFor is required" },
        { status: 400 }
      )
    }
    
    if (applicationIds.length === 0) {
      return NextResponse.json(
        { error: "No applications selected for scheduling" },
        { status: 400 }
      )
    }
    
    // Implement interview scheduling directly in the route handler
    // instead of using the candidate-service.ts file
    try {
      // 1. Verify that all application IDs are valid
      const applications = await prisma.application.findMany({
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
        return NextResponse.json(
          { error: "No valid applications found with the provided IDs" },
          { status: 400 }
        );
      }
      
      // 2. Check if any applications are already scheduled or rejected
      const invalidApplications = applications.filter(app => 
        app.status === "INTERVIEW_SCHEDULED" || app.status === "REJECTED"
      );
      
      if (invalidApplications.length > 0) {
        return NextResponse.json(
          { error: `${invalidApplications.length} applications cannot be scheduled because they are already scheduled or rejected` },
          { status: 400 }
        );
      }
      
      // 3. Generate meeting URL with Google Calendar if not provided
      let calendarEventId = undefined;
      let finalMeetingUrl = meetingUrl;
      
      if (!finalMeetingUrl) {
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
            const { createCalendarEvent } = await import('@/lib/utils/google-calendar');
            
            try {
              const calendarResult = await createCalendarEvent(
                eventTitle,
                description,
                new Date(scheduledFor).toISOString(),
                duration || 60,
                attendeeEmails
              );
              
              if (calendarResult && calendarResult.meetingUrl) {
                finalMeetingUrl = calendarResult.meetingUrl;
                calendarEventId = calendarResult.eventId;
                console.log("Generated meeting URL:", finalMeetingUrl);
              } else {
                throw new Error("Failed to get meeting URL from Google Calendar");
              }
            } catch (calendarError) {
              console.error("Error creating Google Calendar event:", calendarError);
              
              // Generate a fallback URL format for Google Meet
              const randomId = Math.random().toString(36).substring(2, 11);
              finalMeetingUrl = `https://meet.google.com/mock-${randomId}`;
              console.log("Using fallback meeting URL:", finalMeetingUrl);
            }
          } catch (error) {
            console.error("Error creating Google Calendar event:", error);
            
            // Generate a fallback URL format for Google Meet
            const randomId = Math.random().toString(36).substring(2, 11);
            finalMeetingUrl = `https://meet.google.com/mock-${randomId}`;
            console.log("Using fallback meeting URL:", finalMeetingUrl);
          }
        } else {
          // If Google Calendar is disabled, generate a mock URL
          const randomId = Math.random().toString(36).substring(2, 11);
          finalMeetingUrl = `https://meet.google.com/mock-${randomId}`;
          console.log("Google Calendar disabled. Using generated meeting URL:", finalMeetingUrl);
        }
      }
      
      // 4. Create interviews for each application
      const createdInterviews: Interview[] = [];
      const notificationQueue: { email: string; subject: string; html: string }[] = [];

      // Execute the transaction
      await prisma.$transaction(async (tx) => {
        for (const app of applications) {
          const interview = await tx.interview.create({
            data: {
              scheduledFor: new Date(scheduledFor),
              duration: duration || 60,
              meetingUrl: finalMeetingUrl || undefined,
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
                connect: { id: userId }, // Use the Clerk ID directly
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
                <p><strong>Date and Time:</strong> ${new Date(scheduledFor).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${duration || 60} minutes</p>
                <p><strong>Meeting Link:</strong> <a href="${finalMeetingUrl}">${finalMeetingUrl}</a></p>
                <p>Please ensure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
                <p>Best regards,<br/>HR Team</p>
              `
            });
          }
        }
      });

      // 5. Send queued emails after transaction is done
      if (notificationQueue.length > 0) {
        try {
          const { sendEmail } = await import('@/lib/utils/email-service');
          
          for (const emailData of notificationQueue) {
            try {
              if (!emailData || !emailData.email || !emailData.subject || !emailData.html) {
                console.error("Invalid email data:", emailData);
                continue;
              }
              
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
        } catch (emailImportError) {
          console.error("Failed to import email service:", emailImportError);
        }
      }

      console.log(`Successfully scheduled ${createdInterviews.length} interviews`);
      return NextResponse.json({ success: true, interviews: createdInterviews });
    } catch (error) {
      console.error("Error in interview scheduling:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to schedule interviews" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const positionId = searchParams.get("positionId")
    const status = searchParams.get("status")
    
    console.log("Fetching candidates with filters:", { positionId, status });
    
    // Fetch all applications with their candidates and positions
    const applications = await prisma.application.findMany({
      where: {
        // Only filter by position if specified
        ...(positionId ? { positionId } : {}),
        // Only filter by status if specified
        ...(status ? { status: status } : {})
      },
      include: {
        candidate: true,
        position: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            type: true
          }
        },
        interviews: {
          where: {
            status: "Scheduled"
          },
          orderBy: {
            scheduledFor: 'asc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`Found ${applications.length} applications`);
    
    // For debugging - log the first application's position data
    if (applications.length > 0) {
      console.log("First application position data:", {
        positionId: applications[0].positionId,
        positionTitle: applications[0].positionTitle,
        position: applications[0].position
      });
    }

    // Format the data to match the component's expected structure
    const formattedCandidates = applications.map(app => {
      // Ensure position data is available
      const positionData = app.position || { 
        id: app.positionId || "unknown", 
        title: app.positionTitle || "Unknown Position" 
      };
      
      return {
        candidate: app.candidate,
        position: positionData,
        application: app
      };
    });
    
    return NextResponse.json(formattedCandidates)
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    )
  }
}
