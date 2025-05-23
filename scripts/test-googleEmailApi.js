const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['error'],
});

// Google API credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'sonugupta6045@gmail.com';

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN
});

async function testGoogleEmailApi() {
  console.log('===== TESTING GOOGLE EMAIL API INTEGRATION =====');
  let candidate = null;
  let testSuccess = true;
  
  try {
    // Check for required environment variables
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
      console.log('❌ Missing required environment variables:');
      if (!GOOGLE_CLIENT_ID) console.log('  - GOOGLE_CLIENT_ID');
      if (!GOOGLE_CLIENT_SECRET) console.log('  - GOOGLE_CLIENT_SECRET');
      if (!GOOGLE_REFRESH_TOKEN) console.log('  - GOOGLE_REFRESH_TOKEN');
      console.log('\nPlease add these to your .env file and try again.');
      return false;
    }
    
    console.log('✅ Environment variables verified');
    
    // Create a test candidate
    candidate = await prisma.candidate.create({
      data: {
        name: 'Email Test Candidate',
        email: 'test-candidate@example.com', // Use a test email
        resumeUrl: 'https://example.com/test-resume.pdf',
        phone: '1234567890',
        skills: ['JavaScript', 'Node.js'],
        experience: '2 years',
      }
    });
    
    console.log(`✅ Test candidate created with ID: ${candidate.id}`);
    
    // TEST 1: Generate Gmail API access token
    console.log('\nTEST 1: Generating Gmail API access token');
    const accessToken = await getAccessToken();
    console.log('✅ Access token generated successfully');
    
    // TEST 2: Create email transport
    console.log('\nTEST 2: Creating email transport');
    const transport = createMailTransport(accessToken);
    console.log('✅ Email transport created successfully');
    
    // TEST 3: Send test email
    console.log('\nTEST 3: Sending test email to candidate');
    const emailResult = await sendTestEmail(transport, candidate);
    console.log('✅ Test email sent successfully:', emailResult.messageId);
    
    // TEST 4: Send email with attachment
    console.log('\nTEST 4: Sending email with attachment');
    
    // Create a test file if it doesn't exist
    const testFilePath = path.join(__dirname, 'test-attachment.txt');
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'This is a test attachment for the email API test.');
    }
    
    const attachmentResult = await sendEmailWithAttachment(transport, candidate, testFilePath);
    console.log('✅ Email with attachment sent successfully:', attachmentResult.messageId);
    
    return testSuccess;
  } catch (error) {
    console.error('❌ Error during test:', error);
    testSuccess = false;
    return false;
  } finally {
    // Clean up the candidate
    if (candidate) {
      await prisma.candidate.delete({
        where: { id: candidate.id }
      }).catch(err => console.error('Error cleaning up candidate:', err));
    }
    
    // Clean up test attachment
    const testFilePath = path.join(__dirname, 'test-attachment.txt');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    await prisma.$disconnect();
  }
}

// Helper function to get access token
async function getAccessToken() {
  try {
    const { token } = await oAuth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    throw error;
  }
}

// Helper function to create mail transport
function createMailTransport(accessToken) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: SENDER_EMAIL,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken
    }
  });
}

// Helper function to send test email
async function sendTestEmail(transport, candidate) {
  const mailOptions = {
    from: `Recruitment Team <${SENDER_EMAIL}>`,
    to: candidate.email,
    subject: 'API Test: Your Application Status',
    text: `Dear ${candidate.name},\n\nThis is a test email to verify our email notification system. Please ignore this message.\n\nBest regards,\nRecruitment Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">API Test: Your Application Status</h2>
        <p>Dear ${candidate.name},</p>
        <p>This is a test email to verify our email notification system. Please ignore this message.</p>
        <p style="margin-top: 20px;">Best regards,<br>Recruitment Team</p>
      </div>
    `
  };
  
  return await transport.sendMail(mailOptions);
}

// Helper function to send email with attachment
async function sendEmailWithAttachment(transport, candidate, attachmentPath) {
  const mailOptions = {
    from: `Recruitment Team <${SENDER_EMAIL}>`,
    to: candidate.email,
    subject: 'API Test: Your Interview Details',
    text: `Dear ${candidate.name},\n\nThis is a test email with attachment to verify our email notification system. Please ignore this message.\n\nBest regards,\nRecruitment Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">API Test: Your Interview Details</h2>
        <p>Dear ${candidate.name},</p>
        <p>This is a test email with attachment to verify our email notification system. Please ignore this message.</p>
        <p style="margin-top: 20px;">Best regards,<br>Recruitment Team</p>
      </div>
    `,
    attachments: [
      {
        filename: 'interview-details.txt',
        path: attachmentPath
      }
    ]
  };
  
  return await transport.sendMail(mailOptions);
}

// Run the test
testGoogleEmailApi()
  .then(success => {
    console.log(success ? '\n✅ Google Email API test completed successfully' : '\n❌ Google Email API test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });