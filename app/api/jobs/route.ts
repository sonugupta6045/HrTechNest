import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Only fetch OPEN positions for public display
    const jobs = await db.position.findMany({
      where: {
        status: "OPEN" // Only return positions with OPEN status
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}