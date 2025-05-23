import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  // OAuth2 client for Gmail or Google Calendar
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "http://localhost:3000/api/google/callback" // 👈 Must match your Google Console redirect URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // ✅ Log tokens for now (you should store them securely in a DB like NeonDB)
    console.log("✅ Access Token:", tokens.access_token);
    console.log("🔁 Refresh Token:", tokens.refresh_token);
    console.log("⏳ Expiry Date:", tokens.expiry_date);

    return NextResponse.json({
      message: "Google OAuth successful",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });
  } catch (error) {
    console.error("❌ Error exchanging code for tokens:", error);
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }
}
