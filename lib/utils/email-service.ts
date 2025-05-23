import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Email message interface
interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
}

/**
 * Send an email
 * 
 * @param emailData The email data to send
 * @returns Promise resolving to true if sent successfully
 */
export async function sendEmail(emailData: EmailMessage | null | undefined): Promise<boolean> {
  try {
    // Null or invalid object check
    if (!emailData || typeof emailData !== 'object') {
      console.error("sendEmail received invalid payload:", emailData);
      throw new TypeError('The "payload" argument must be of type object. Received null or invalid');
    }

    const { to, subject, text, html, cc, bcc } = emailData;

    // Required fields check
    if (!to || !subject || !(text || html)) {
      console.error("Missing required email fields:", emailData);
      throw new Error("Missing required email fields (to, subject, text or html)");
    }

    // Log email info in development
    if (process.env.NODE_ENV !== "production") {
      console.log("\n--- EMAIL WOULD BE SENT IN PRODUCTION ---");
      console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
      console.log(`Subject: ${subject}`);
      if (cc) console.log(`CC: ${Array.isArray(cc) ? cc.join(", ") : cc}`);
      if (bcc) console.log(`BCC: ${Array.isArray(bcc) ? bcc.join(", ") : bcc}`);
      console.log("Content:");
      html ? console.log("HTML content available") : console.log(text);
      console.log("--- END EMAIL ---\n");

      if (process.env.SEND_REAL_EMAILS !== "true") {
        return true; // Prevent real sending in dev unless explicitly enabled
      }
    }

    // Send via Gmail API
    await sendWithGmailApi(emailData);
    return true;

  } catch (error) {
    console.error("Error sending email:", error);

    // Continue in dev mode despite error
    if (process.env.NODE_ENV !== "production") {
      console.warn("Email sending failed, but continuing in development.");
      return true;
    }

    return false;
  }
}

/**
 * Send an email using Gmail API
 * 
 * @param emailData The email data to send
 */
async function sendWithGmailApi(emailData: EmailMessage): Promise<void> {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const to = Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to;
  const cc = emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc) : '';
  const bcc = emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(', ') : emailData.bcc) : '';

  const emailLines = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${emailData.subject}`,
    '',
    emailData.html || emailData.text || ''
  ].filter(Boolean);

  const email = emailLines.join('\r\n');

  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail
    }
  });
}
