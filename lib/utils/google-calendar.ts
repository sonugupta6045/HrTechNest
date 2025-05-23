import { google } from 'googleapis';

/**
 * Creates a Google Calendar event for an interview and returns the event link
 * 
 * @param summary Title of the event
 * @param description Description of the event
 * @param startTime Start time of the interview (ISO string)
 * @param duration Duration in minutes
 * @param attendees List of email addresses to invite
 * @returns Object containing the meeting URL and event ID
 */
export async function createCalendarEvent(
  summary: string,
  description: string,
  startTime: string,
  duration: number = 60,
  attendees: string[]
): Promise<{ meetingUrl: string, eventId: string }> {
  try {
    // Create OAuth2 client with credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground' // Redirect URI
    );

    // Add debugging logs
    console.log("OAuth2 Client created with:");
    console.log("Client ID exists:", !!process.env.GOOGLE_CALENDAR_CLIENT_ID);
    console.log("Client Secret exists:", !!process.env.GOOGLE_CALENDAR_CLIENT_SECRET);
    console.log("Refresh Token exists:", !!process.env.GOOGLE_CALENDAR_REFRESH_TOKEN);

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
    });

    // Create Google Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Calculate end time
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // Format attendees
    const formattedAttendees = attendees.map(email => ({
      email,
      responseStatus: 'needsAction'
    }));

    // Create event with Google Meet link
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      },
      attendees: formattedAttendees,
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 } // 30 minutes before
        ]
      }
    };

    try {
      // Insert the event
      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event as any
      });
      
      const createdEvent = response.data;
      
      // Extract Google Meet link and event ID
      const meetingUrl = createdEvent.hangoutLink || '';
      const eventId = createdEvent.id || '';
      
      return { meetingUrl, eventId };
    } catch (error: any) {
      console.error('Error creating Google Calendar event:', error);
      
      // Check for invalid_grant error (expired refresh token)
      if (error.message && error.message.includes('invalid_grant')) {
        console.error('Google Calendar refresh token has expired. Please generate a new one.');
        
        // Fallback to a randomly generated meet URL in development
        if (process.env.NODE_ENV === 'development') {
          const randomMeetId = Math.random().toString(36).substring(2, 11);
          return {
            meetingUrl: `https://meet.google.com/${randomMeetId}`,
            eventId: `mock-event-${Date.now()}`
          };
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    
    // For development or if API call fails, generate a mock Meet link
    // In production, you would handle this error differently
    if (process.env.NODE_ENV === 'development') {
      return { 
        meetingUrl: `https://meet.google.com/mock-${Math.random().toString(36).substring(2, 10)}`,
        eventId: `mock-event-${Math.random().toString(36).substring(2, 10)}`
      };
    }
    
    throw error;
  }
} 